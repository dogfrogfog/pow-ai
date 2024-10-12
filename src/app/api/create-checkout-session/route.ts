import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const user = await clerkClient().users.getUser(userId);

    let stripeCustomerId = user.privateMetadata.stripeCustomerId as string;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.emailAddresses[0].emailAddress,
        name: `${user.firstName} ${user.lastName}`,
      });
      stripeCustomerId = customer.id;
      await clerkClient().users.updateUser(userId, {
        privateMetadata: { ...user.privateMetadata, stripeCustomerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: "price_1Q84UWH2Uiuad1BlpSQUUUYD", // Replace with your actual price ID
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get(
        "origin"
      )}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/dashboard`,
    });

    // Update Clerk user with Stripe Customer ID
    await clerkClient().users.updateUser(userId, {
      externalId: stripeCustomerId,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new NextResponse("Error creating checkout session", { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { clerkClient } from "@clerk/nextjs/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const session = event.data.object as
    | Stripe.Checkout.Session
    | Stripe.Subscription;

  // Handle subscription created or updated
  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    const user = await clerkClient.users.getUserList({
      externalId: customerId,
    });

    if (user.length > 0) {
      await clerkClient.users.updateUser(user[0].id, {
        privateMetadata: {
          isSubscribed: subscription.status === "active",
          stripeSubscriptionId: subscription.id,
          stripePlanId: subscription.items.data[0].price.id,
        },
      });
    }
  }

  // Handle subscription deleted
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    const user = await clerkClient.users.getUserList({
      externalId: customerId,
    });

    if (user.length > 0) {
      await clerkClient.users.updateUser(user[0].id, {
        privateMetadata: {
          isSubscribed: false,
          stripeSubscriptionId: null,
          stripePlanId: null,
        },
      });
    }
  }

  // Handle successful payment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const customerId = session.customer as string;

    const user = await clerkClient.users.getUserList({
      externalId: customerId,
    });

    if (user.length > 0) {
      await clerkClient.users.updateUser(user[0].id, {
        privateMetadata: {
          isSubscribed: true,
        },
      });
    }
  }

  return new NextResponse(null, { status: 200 });
}

import { DocumentCreation } from "@/components/document-creation";
import { UserButton } from "@clerk/nextjs";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { SubscriptionButton } from "@/components/subscription-button";
import Link from "next/link";
import { stripe } from "@/lib/stripe";
import { redirect } from "next/navigation";

async function getActiveSubscription(stripeCustomerId: string | undefined) {
  if (!stripeCustomerId) return null;

  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "active",
      // expand: ['data.default_payment_method'],
    });

    return subscriptions.data.length > 0 ? subscriptions.data[0] : null;
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return null;
  }
}

export default async function Dashboard() {
  const { userId } = auth();

  if (!userId) {
    return <div>Please sign in to access the dashboard.</div>;
  }

  const user = await clerkClient().users.getUser(userId);
  const stripeCustomerId = user.privateMetadata.stripeCustomerId as
    | string
    | undefined;
  const activeSubscription = await getActiveSubscription(stripeCustomerId);

  async function saveToRedis(prompt: string, completion: string) {
    "use server";
    // Implement your Redis saving logic here
  }

  async function createPortalSession() {
    "use server";

    if (!stripeCustomerId) {
      throw new Error("No Stripe customer ID found");
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `http://localhost:3000/dashboard`,
    });

    redirect(session.url);
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <UserButton afterSignOutUrl="/" />
      </div>
      <p className="mb-4">Welcome, user {userId}!</p>
      {activeSubscription ? (
        <>
          <DocumentCreation saveToRedis={saveToRedis} />
          <div className="mt-8">
            <Link
              href="/dashboard/documents"
              className="text-blue-500 hover:underline"
            >
              View Your Documents
            </Link>
          </div>
          <form action={createPortalSession} className="mt-4">
            <button type="submit" className="text-blue-500 hover:underline">
              Manage Subscription
            </button>
          </form>
        </>
      ) : (
        <div>
          <p>Subscribe to access all features:</p>
        </div>
      )}
      <div className="mt-4">
        <SubscriptionButton
          stripeCustomerId={stripeCustomerId}
          createPortalSession={createPortalSession}
        />
      </div>
    </div>
  );
}

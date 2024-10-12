"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";

export function SubscriptionButton({
  createPortalSession,
  stripeCustomerId,
}: {
  createPortalSession: () => Promise<void>;
  stripeCustomerId: string | undefined;
}) {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscription = async () => {
    setIsLoading(true);
    try {
      if (stripeCustomerId) {
        await createPortalSession();
        return;
      }

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
      });
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Error handling subscription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Button onClick={handleSubscription} disabled={isLoading}>
      {isLoading
        ? "Loading..."
        : stripeCustomerId
        ? "Manage Subscription"
        : "Subscribe"}
    </Button>
  );
}

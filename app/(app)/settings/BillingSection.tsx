"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Subscription {
  plan: string | null;
  status: string | null;
  current_period_end: string | null;
  stripe_customer_id: string | null;
}

interface BillingSectionProps {
  subscription: Subscription | null;
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  trialing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  past_due: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  canceled: "bg-red-500/20 text-red-400 border-red-500/30",
};

export function BillingSection({ subscription }: BillingSectionProps) {
  const [loading, setLoading] = useState(false);

  async function handleManageBilling() {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
    setLoading(false);
  }

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-warm-gold/50 uppercase tracking-wider">
        Subscription
      </h2>
      <div className="rounded-xl border border-steel-border bg-dark-carbon p-6 space-y-4">
        {subscription ? (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-warm-gold font-medium capitalize">
                  Dyagno {subscription.plan ?? "â€”"}
                </p>
                {subscription.current_period_end && (
                  <p className="text-xs text-warm-gold/40 mt-1">
                    {subscription.status === "canceled"
                      ? "Access until"
                      : "Renews"}{" "}
                    {new Date(subscription.current_period_end).toLocaleDateString()}
                  </p>
                )}
              </div>
              {subscription.status && (
                <Badge
                  variant="outline"
                  className={STATUS_COLORS[subscription.status] ?? ""}
                >
                  {subscription.status}
                </Badge>
              )}
            </div>

            {subscription.stripe_customer_id && (
              <Button
                onClick={handleManageBilling}
                disabled={loading}
                variant="outline"
                className="border-steel-border text-warm-gold/70 hover:bg-dark-chrome hover:text-warm-gold"
              >
                {loading ? "Loadingâ€¦" : "Manage billing â†’"}
              </Button>
            )}
          </>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-warm-gold/50">No active subscription.</p>
            <Button
              onClick={() => (window.location.href = "/pricing")}
              className="bg-forge-amber text-ink font-semibold hover:bg-forge-amber/90"
              size="sm"
            >
              View plans
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

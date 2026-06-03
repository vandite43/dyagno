"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DyagnoLogo } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/browser";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    monthly: 19,
    yearly: 190,
    description: "For homeowners and occasional repair work.",
    features: [
      "Unlimited diagnoses",
      "Photo uploads (up to 5 per session)",
      "Error code lookup",
      "Part number identification",
      "Repair step guidance",
      "Email support",
    ],
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PRICE_ID,
    yearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PRICE_ID,
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 49,
    yearly: 490,
    description: "For professional technicians and repair shops.",
    features: [
      "Everything in Starter",
      "Unlimited photo uploads",
      "Priority AI responses",
      "Diagnosis history & search",
      "Multi-appliance session context",
      "Priority support",
    ],
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
    yearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID,
    highlighted: true,
  },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const router = useRouter();

  async function handleSelectPlan(plan: (typeof PLANS)[0]) {
    setLoadingPlan(plan.id);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/signup`);
      return;
    }

    const priceId =
      billing === "monthly" ? plan.monthlyPriceId : plan.yearlyPriceId;

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });

    const { url, error } = await res.json();
    if (error) {
      setLoadingPlan(null);
      return;
    }

    window.location.href = url;
  }

  return (
    <>
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-steel-border bg-dark-chrome/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <DyagnoLogo size={32} variant="dark" showWordmark />
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-warm-gold/70 hover:text-warm-gold hover:bg-dark-carbon">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-forge-amber text-ink font-semibold hover:bg-forge-amber/90">
                Get started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="pt-16 min-h-screen py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <h1
              className="text-4xl font-bold text-warm-gold"
              style={{ fontFamily: "var(--font-space-grotesk)", letterSpacing: "-0.03em" }}
            >
              Simple, honest pricing
            </h1>
            <p className="text-warm-gold/50">Try free for 7 days. No credit card required.</p>

            <div className="inline-flex items-center rounded-lg border border-steel-border bg-dark-carbon p-1">
              <button
                onClick={() => setBilling("monthly")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  billing === "monthly"
                    ? "bg-forge-amber text-ink"
                    : "text-warm-gold/50 hover:text-warm-gold"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling("yearly")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  billing === "yearly"
                    ? "bg-forge-amber text-ink"
                    : "text-warm-gold/50 hover:text-warm-gold"
                }`}
              >
                Yearly
                <Badge className="bg-forge-amber/20 text-forge-amber border-forge-amber/30 text-[10px]">
                  2 months free
                </Badge>
              </button>
            </div>
          </div>

          <div className=”grid grid-cols-1 sm:grid-cols-3 gap-6”>
            {/* Free trial card */}
            <div className=”rounded-2xl border border-steel-border bg-dark-carbon p-8 space-y-6 relative”>
              <div className=”absolute -top-3 left-1/2 -translate-x-1/2”>
                <Badge className=”bg-dark-chrome border border-forge-amber/40 text-forge-amber font-semibold”>
                  No card needed
                </Badge>
              </div>

              <div>
                <h2 className=”text-xl font-bold text-warm-gold” style={{ fontFamily: “var(--font-space-grotesk)” }}>
                  Free Trial
                </h2>
                <p className=”text-sm text-warm-gold/50 mt-1”>Try Dyagno risk-free for 7 days.</p>
              </div>

              <div className=”flex items-end gap-1”>
                <span className=”text-5xl font-bold text-warm-gold” style={{ fontFamily: “var(--font-space-grotesk)” }}>
                  $0
                </span>
                <span className=”text-warm-gold/40 mb-2”>/7 days</span>
              </div>

              <Button
                onClick={() => router.push(“/signup”)}
                className=”w-full font-semibold border-steel-border text-warm-gold hover:bg-dark-chrome”
                variant=”outline”
              >
                Start free trial
              </Button>

              <ul className=”space-y-3”>
                {[
                  “Full access for 7 days”,
                  “Unlimited diagnoses”,
                  “Photo uploads”,
                  “Part number identification”,
                  “Repair step guidance”,
                  “No credit card required”,
                ].map((f) => (
                  <li key={f} className=”flex items-start gap-3 text-sm text-warm-gold/70”>
                    <span className=”text-forge-amber mt-0.5”>&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl border p-8 space-y-6 relative ${
                  plan.highlighted
                    ? “border-forge-amber bg-dark-carbon”
                    : “border-steel-border bg-dark-carbon”
                }`}
              >
                {plan.highlighted && (
                  <div className=”absolute -top-3 left-1/2 -translate-x-1/2”>
                    <Badge className=”bg-forge-amber text-ink font-semibold border-0”>
                      Most popular
                    </Badge>
                  </div>
                )}

                <div>
                  <h2 className=”text-xl font-bold text-warm-gold” style={{ fontFamily: “var(--font-space-grotesk)” }}>
                    {plan.name}
                  </h2>
                  <p className=”text-sm text-warm-gold/50 mt-1”>{plan.description}</p>
                </div>

                <div className=”flex items-end gap-1”>
                  <span className=”text-5xl font-bold text-warm-gold” style={{ fontFamily: “var(--font-space-grotesk)” }}>
                    ${billing === “monthly” ? plan.monthly : Math.round(plan.yearly / 12)}
                  </span>
                  <span className=”text-warm-gold/40 mb-2”>/mo</span>
                </div>
                {billing === “yearly” && (
                  <p className=”text-xs text-warm-gold/40 -mt-4”>Billed as ${plan.yearly}/year</p>
                )}

                <Button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={loadingPlan === plan.id}
                  className={`w-full font-semibold ${
                    plan.highlighted
                      ? “bg-forge-amber text-ink hover:bg-forge-amber/90”
                      : “border-steel-border text-warm-gold hover:bg-dark-chrome”
                  }`}
                  variant={plan.highlighted ? “default” : “outline”}
                >
                  {loadingPlan === plan.id ? “Loading...” : “Get started”}
                </Button>

                <ul className=”space-y-3”>
                  {plan.features.map((f) => (
                    <li key={f} className=”flex items-start gap-3 text-sm text-warm-gold/70”>
                      <span className=”text-forge-amber mt-0.5”>&#10003;</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

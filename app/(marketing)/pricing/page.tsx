"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DyagnoLogo } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/browser";

const STARTER_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PRICE_ID;
const STARTER_YEARLY = process.env.NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PRICE_ID;
const PRO_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID;
const PRO_YEARLY = process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID;
const SINGLE_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_SINGLE_PRICE_ID;

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showEnterprise, setShowEnterprise] = useState(false);
  const [contactForm, setContactForm] = useState({ company: "", size: "", email: "", message: "" });
  const [contactSent, setContactSent] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const router = useRouter();

  async function handleCheckout(priceId: string | undefined, planKey: string) {
    if (!priceId) return;
    setLoadingPlan(planKey);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/signup"); return; }

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });
    const { url, error } = await res.json();
    if (error) { setLoadingPlan(null); return; }
    window.location.href = url;
  }

  async function handleContact(e: React.FormEvent) {
    e.preventDefault();
    setContactLoading(true);
    setContactError(null);
    try {
      const res = await fetch("/api/enterprise/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: contactForm.company,
          team_size: contactForm.size,
          email: contactForm.email,
          message: contactForm.message,
        }),
      });
      if (!res.ok) throw new Error("Server error");
      setContactSent(true);
    } catch {
      setContactError("Something went wrong. Please email us directly at hello@dyagno.com");
    } finally {
      setContactLoading(false);
    }
  }

  const check = <span className="text-forge-amber mt-0.5">&#10003;</span>;

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 border-b border-steel-border bg-dark-chrome/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <DyagnoLogo size={32} variant="dark" showWordmark />
          </Link>
          <nav className="flex items-center gap-2 sm:gap-6">
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="text-warm-gold/70 hover:text-warm-gold hover:bg-dark-carbon">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-forge-amber text-ink font-semibold hover:bg-forge-amber/90">Get started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="pt-16 min-h-screen py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-4xl font-bold text-warm-gold" style={{ fontFamily: "var(--font-space-grotesk)", letterSpacing: "-0.03em" }}>
              Simple, honest pricing
            </h1>
            <p className="text-warm-gold/50">Try free for 7 days. No credit card required.</p>

            <div className="inline-flex items-center rounded-lg border border-steel-border bg-dark-carbon p-1">
              <button onClick={() => setBilling("monthly")} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${billing === "monthly" ? "bg-forge-amber text-ink" : "text-warm-gold/50 hover:text-warm-gold"}`}>Monthly</button>
              <button onClick={() => setBilling("yearly")} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${billing === "yearly" ? "bg-forge-amber text-ink" : "text-warm-gold/50 hover:text-warm-gold"}`}>
                Yearly
                <Badge className="bg-forge-amber/20 text-forge-amber border-forge-amber/30 text-[10px]">2 months free</Badge>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

            {/* Single */}
            <div className="rounded-2xl border border-steel-border bg-dark-carbon p-8 space-y-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-dark-chrome border border-steel-border text-warm-gold/60 font-semibold">Pay once</Badge>
              </div>
              <div>
                <h2 className="text-xl font-bold text-warm-gold" style={{ fontFamily: "var(--font-space-grotesk)" }}>Single</h2>
                <p className="text-sm text-warm-gold/50 mt-1">One session, no commitment.</p>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-5xl font-bold text-warm-gold" style={{ fontFamily: "var(--font-space-grotesk)" }}>$12</span>
                <span className="text-warm-gold/40 mb-2">one-time</span>
              </div>
              <Button onClick={() => handleCheckout(SINGLE_PRICE_ID, "single")} disabled={loadingPlan === "single"} className="w-full font-semibold border-steel-border text-warm-gold hover:bg-dark-chrome" variant="outline">
                {loadingPlan === "single" ? "Loading..." : "Buy one session"}
              </Button>
              <ul className="space-y-3">
                {["1 diagnosis session", "7-day session window", "Unlimited messages in session", "No photo uploads", "No session history", "No support"].map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-warm-gold/70">{check}{f}</li>
                ))}
              </ul>
            </div>

            {/* Starter */}
            <div className="rounded-2xl border border-steel-border bg-dark-carbon p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-warm-gold" style={{ fontFamily: "var(--font-space-grotesk)" }}>Starter</h2>
                <p className="text-sm text-warm-gold/50 mt-1">For homeowners and occasional repair work.</p>
              </div>
              <div>
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-bold text-warm-gold" style={{ fontFamily: "var(--font-space-grotesk)" }}>${billing === "monthly" ? 19 : 16}</span>
                  <span className="text-warm-gold/40 mb-2">/mo</span>
                </div>
                {billing === "yearly" && <p className="text-xs text-warm-gold/40">Billed as $190/year</p>}
              </div>
              <Button onClick={() => handleCheckout(billing === "monthly" ? STARTER_MONTHLY : STARTER_YEARLY, "starter")} disabled={loadingPlan === "starter"} className="w-full font-semibold border-steel-border text-warm-gold hover:bg-dark-chrome" variant="outline">
                {loadingPlan === "starter" ? "Loading..." : "Get started"}
              </Button>
              <ul className="space-y-3">
                {["3 sessions per day", "3 photo uploads per session", "30-day history", "Error code & part lookup", "Repair step guidance", "Email support"].map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-warm-gold/70">{check}{f}</li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="rounded-2xl border border-forge-amber bg-dark-carbon p-8 space-y-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-forge-amber text-ink font-semibold border-0">Most popular</Badge>
              </div>
              <div>
                <h2 className="text-xl font-bold text-warm-gold" style={{ fontFamily: "var(--font-space-grotesk)" }}>Pro</h2>
                <p className="text-sm text-warm-gold/50 mt-1">For professional technicians and repair shops.</p>
              </div>
              <div>
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-bold text-warm-gold" style={{ fontFamily: "var(--font-space-grotesk)" }}>${billing === "monthly" ? 49 : 41}</span>
                  <span className="text-warm-gold/40 mb-2">/mo</span>
                </div>
                {billing === "yearly" && <p className="text-xs text-warm-gold/40">Billed as $490/year</p>}
              </div>
              <Button onClick={() => handleCheckout(billing === "monthly" ? PRO_MONTHLY : PRO_YEARLY, "pro")} disabled={loadingPlan === "pro"} className="w-full font-semibold bg-forge-amber text-ink hover:bg-forge-amber/90">
                {loadingPlan === "pro" ? "Loading..." : "Get started"}
              </Button>
              <ul className="space-y-3">
                {["Unlimited sessions", "Unlimited photo uploads", "Full history + search", "Multi-appliance context", "Priority AI responses", "Email support"].map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-warm-gold/70">{check}{f}</li>
                ))}
              </ul>
            </div>

            {/* Enterprise */}
            <div className="rounded-2xl border border-steel-border bg-dark-carbon p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-warm-gold" style={{ fontFamily: "var(--font-space-grotesk)" }}>Enterprise</h2>
                <p className="text-sm text-warm-gold/50 mt-1">For repair shops and teams. Min 5 seats.</p>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold text-warm-gold" style={{ fontFamily: "var(--font-space-grotesk)" }}>Custom</span>
              </div>
              <Button onClick={() => setShowEnterprise(true)} className="w-full font-semibold border-steel-border text-warm-gold hover:bg-dark-chrome" variant="outline">
                Contact us for teams
              </Button>
              <ul className="space-y-3">
                {["Everything in Pro", "Team management dashboard", "Per-technician usage reports", "Custom branding", "Dedicated support", "Per-seat billing"].map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-warm-gold/70">{check}{f}</li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </main>

      {/* Enterprise contact modal */}
      {showEnterprise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) { setShowEnterprise(false); setContactForm({ company: "", size: "", email: "", message: "" }); setContactSent(false); setContactError(null); } }}>
          <div className="w-full max-w-md bg-dark-carbon border border-steel-border rounded-2xl p-8 space-y-6">
            {contactSent ? (
              <div className="text-center space-y-3 py-4">
                <p className="text-2xl font-bold text-warm-gold" style={{ fontFamily: "var(--font-space-grotesk)" }}>We'll be in touch.</p>
                <p className="text-sm text-warm-gold/50">We typically respond within one business day.</p>
                <Button onClick={() => { setShowEnterprise(false); setContactSent(false); setContactForm({ company: "", size: "", email: "", message: "" }); }} variant="outline" className="border-steel-border text-warm-gold hover:bg-dark-chrome mt-4">Close</Button>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-warm-gold" style={{ fontFamily: "var(--font-space-grotesk)" }}>Contact us for Enterprise</h2>
                    <p className="text-sm text-warm-gold/50 mt-1">Min 5 seats. Custom pricing per team.</p>
                  </div>
                  <button onClick={() => { setShowEnterprise(false); setContactForm({ company: "", size: "", email: "", message: "" }); setContactError(null); }} className="text-warm-gold/40 hover:text-warm-gold text-2xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleContact} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-warm-gold/60">Company name</Label>
                    <Input required value={contactForm.company} onChange={e => setContactForm(f => ({ ...f, company: e.target.value }))} placeholder="Acme Appliance Repair" className="bg-dark-chrome border-steel-border text-warm-gold placeholder:text-warm-gold/25 focus-visible:ring-forge-amber" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-warm-gold/60">Team size</Label>
                    <select required value={contactForm.size} onChange={e => setContactForm(f => ({ ...f, size: e.target.value }))} className="w-full h-10 rounded-md border border-steel-border bg-dark-chrome text-warm-gold px-3 text-sm focus:outline-none focus:ring-1 focus:ring-forge-amber">
                      <option value="">Select team size</option>
                      <option value="5-10">5 - 10</option>
                      <option value="11-25">11 - 25</option>
                      <option value="26-100">26 - 100</option>
                      <option value="100+">100+</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-warm-gold/60">Work email</Label>
                    <Input required type="email" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} placeholder="you@company.com" className="bg-dark-chrome border-steel-border text-warm-gold placeholder:text-warm-gold/25 focus-visible:ring-forge-amber" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-warm-gold/60">Message (optional)</Label>
                    <textarea value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))} placeholder="Tell us about your use case..." rows={3} className="w-full rounded-md border border-steel-border bg-dark-chrome text-warm-gold placeholder:text-warm-gold/25 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-forge-amber resize-none" />
                  </div>
                  {contactError && (
                    <p className="text-sm text-red-400 bg-red-500/10 border border-red-400/30 rounded-lg px-3 py-2">{contactError}</p>
                  )}
                  <Button type="submit" disabled={contactLoading} className="w-full bg-forge-amber text-ink font-semibold hover:bg-forge-amber/90">
                    {contactLoading ? "Sending..." : "Send message"}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

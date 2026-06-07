"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { DyagnoLogo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next") ?? "/dashboard";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUnconfirmed(false);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        setUnconfirmed(true);
      } else {
        setError("Invalid email or password.");
      }
      setLoading(false);
    } else {
      // Ensure profile row exists (email signups skip the OAuth callback)
      if (data.user) {
        await supabase.from("profiles").upsert(
          { id: data.user.id, full_name: data.user.user_metadata?.full_name ?? null },
          { onConflict: "id", ignoreDuplicates: true }
        );
      }
      router.push(next);
      router.refresh();
    }
  }

  async function handleResend() {
    setResendState("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) {
      setError(error.message);
      setResendState("idle");
    } else {
      setResendState("sent");
    }
  }

  return (
    <div className="w-full max-w-sm space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-warm-gold/50 hover:text-warm-gold transition-colors"
      >
        <span aria-hidden>&larr;</span> Back to home
      </Link>
      <div className="flex flex-col items-center gap-3">
        <DyagnoLogo size={48} variant="dark" />
        <div className="text-center">
          <h1
            className="text-2xl font-bold text-warm-gold"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Sign in to Dyagno
          </h1>
          <p className="mt-1 text-sm text-warm-gold/60">
            Appliance repair intelligence
          </p>
        </div>
      </div>

      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-warm-gold/80">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-dark-carbon border-steel-border text-warm-gold placeholder:text-warm-gold/30 focus-visible:ring-forge-amber"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-warm-gold/80">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-dark-carbon border-steel-border text-warm-gold placeholder:text-warm-gold/30 focus-visible:ring-forge-amber"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        {unconfirmed && (
          <div className="rounded-md border border-forge-amber/30 bg-forge-amber/10 px-4 py-3 space-y-2">
            <p className="text-sm text-warm-gold">
              Please confirm your email before signing in.
            </p>
            {resendState === "sent" ? (
              <p className="text-xs text-forge-amber font-medium">Confirmation email sent — check your inbox.</p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendState === "sending"}
                className="text-xs text-forge-amber underline underline-offset-4 hover:text-warm-gold disabled:opacity-50"
              >
                {resendState === "sending" ? "Sending..." : "Resend confirmation email"}
              </button>
            )}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-forge-amber text-ink font-semibold hover:bg-forge-amber/90"
        >
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="text-center text-sm text-warm-gold/50">
        No account?{" "}
        <Link
          href="/signup"
          className="text-forge-amber hover:text-warm-gold underline underline-offset-4"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-sm space-y-8 animate-pulse">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-steel-border" />
            <div className="h-8 w-40 rounded bg-steel-border" />
          </div>
          <div className="space-y-4">
            <div className="h-10 rounded bg-steel-border" />
            <div className="h-10 rounded bg-steel-border" />
            <div className="h-10 rounded bg-forge-amber/30" />
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

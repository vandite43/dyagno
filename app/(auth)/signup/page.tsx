"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { DyagnoLogo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/pricing");
    }
  }

  return (
    <div className="w-full max-w-sm space-y-8">
      <div className="flex flex-col items-center gap-3">
        <DyagnoLogo size={48} variant="dark" />
        <div className="text-center">
          <h1
            className="text-2xl font-bold text-warm-gold"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Create your account
          </h1>
          <p className="mt-1 text-sm text-warm-gold/60">
            Start diagnosing appliance faults with AI
          </p>
        </div>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-warm-gold/80">
            Full name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Jane Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="bg-dark-carbon border-steel-border text-warm-gold placeholder:text-warm-gold/30 focus-visible:ring-forge-amber"
          />
        </div>
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
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="bg-dark-carbon border-steel-border text-warm-gold placeholder:text-warm-gold/30 focus-visible:ring-forge-amber"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-forge-amber text-ink font-semibold hover:bg-forge-amber/90"
        >
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-warm-gold/50">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-forge-amber hover:text-warm-gold underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

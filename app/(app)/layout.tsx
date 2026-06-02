import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DyagnoLogo } from "@/components/brand";
import { Button } from "@/components/ui/button";

async function SignOutButton() {
  return (
    <form action="/auth/signout" method="POST">
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="text-warm-gold/50 hover:text-warm-gold hover:bg-dark-carbon text-xs"
      >
        Sign out
      </Button>
    </form>
  );
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex flex-col min-h-screen bg-dark-chrome">
      <header className="border-b border-steel-border bg-dark-carbon">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard">
              <DyagnoLogo size={28} variant="dark" showWordmark />
            </Link>
            <nav className="hidden sm:flex gap-4 text-sm">
              <Link
                href="/dashboard"
                className="text-warm-gold/60 hover:text-warm-gold transition-colors"
              >
                Diagnoses
              </Link>
              <Link
                href="/parts"
                className="text-warm-gold/60 hover:text-warm-gold transition-colors"
              >
                Part Lookup
              </Link>
              <Link
                href="/diagrams"
                className="text-warm-gold/60 hover:text-warm-gold transition-colors"
              >
                Diagrams
              </Link>
              <Link
                href="/settings"
                className="text-warm-gold/60 hover:text-warm-gold transition-colors"
              >
                Settings
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/chat/new">
              <Button
                size="sm"
                className="bg-forge-amber text-ink font-semibold hover:bg-forge-amber/90 text-xs"
              >
                New diagnosis
              </Button>
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}

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
              <Link href="/dashboard" className="text-warm-gold/60 hover:text-warm-gold transition-colors">Diagnoses</Link>
              <Link href="/parts" className="text-warm-gold/60 hover:text-warm-gold transition-colors">Part Lookup</Link>
              <Link href="/diagrams" className="text-warm-gold/60 hover:text-warm-gold transition-colors">Diagrams</Link>
              <Link href="/settings" className="text-warm-gold/60 hover:text-warm-gold transition-colors">Settings</Link>
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/chat/new">
              <Button size="sm" className="bg-forge-amber text-ink font-semibold hover:bg-forge-amber/90 text-xs">
                New diagnosis
              </Button>
            </Link>
            <div className="hidden sm:block">
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-16 sm:pb-0">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-dark-carbon border-t border-steel-border flex items-stretch h-16">
        <Link href="/dashboard" className="flex-1 flex flex-col items-center justify-center gap-1 text-warm-gold/50 hover:text-warm-gold active:text-forge-amber transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span className="text-[10px] font-medium">Diagnoses</span>
        </Link>
        <Link href="/parts" className="flex-1 flex flex-col items-center justify-center gap-1 text-warm-gold/50 hover:text-warm-gold active:text-forge-amber transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span className="text-[10px] font-medium">Parts</span>
        </Link>
        <Link href="/chat/new" className="flex-1 flex flex-col items-center justify-center gap-1">
          <div className="w-10 h-10 rounded-full bg-forge-amber flex items-center justify-center shadow-lg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1c1a14" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </div>
        </Link>
        <Link href="/diagrams" className="flex-1 flex flex-col items-center justify-center gap-1 text-warm-gold/50 hover:text-warm-gold active:text-forge-amber transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
          </svg>
          <span className="text-[10px] font-medium">Diagrams</span>
        </Link>
        <Link href="/settings" className="flex-1 flex flex-col items-center justify-center gap-1 text-warm-gold/50 hover:text-warm-gold active:text-forge-amber transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          <span className="text-[10px] font-medium">Settings</span>
        </Link>
      </nav>
    </div>
  );
}

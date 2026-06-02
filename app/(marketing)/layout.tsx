import Link from "next/link";
import { DyagnoLogo } from "@/components/brand";
import { Button } from "@/components/ui/button";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 border-b border-steel-border bg-dark-chrome/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <DyagnoLogo size={32} variant="dark" showWordmark />
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/pricing"
              className="text-sm text-warm-gold/70 hover:text-warm-gold transition-colors"
            >
              Pricing
            </Link>
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-warm-gold/70 hover:text-warm-gold hover:bg-dark-carbon"
              >
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="sm"
                className="bg-forge-amber text-ink font-semibold hover:bg-forge-amber/90"
              >
                Get started
              </Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 pt-16">{children}</main>
      <footer className="border-t border-steel-border py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <DyagnoLogo size={24} variant="dark" showWordmark />
          <p className="text-xs text-warm-gold/30">
            Â© {new Date().getFullYear()} Dyagno. Appliance Repair Intelligence.
          </p>
          <nav className="flex gap-4 text-xs text-warm-gold/40">
            <Link href="/pricing" className="hover:text-warm-gold/70">
              Pricing
            </Link>
            <Link href="/login" className="hover:text-warm-gold/70">
              Sign in
            </Link>
          </nav>
        </div>
      </footer>
    </>
  );
}

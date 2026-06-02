import Link from "next/link";
import { DyagnoLogo, PulseRing } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    icon: "◈",
    title: "Multimodal diagnosis",
    desc: "Upload photos of error codes, damaged components, or installation tags. Claude analyzes the image and your description together.",
  },
  {
    icon: "⌨",
    title: "Error code lookup",
    desc: "Instantly decode manufacturer-specific fault codes for all major appliance brands — refrigerators, washers, dryers, dishwashers, and more.",
  },
  {
    icon: "⊕",
    title: "Part recommendations",
    desc: "Get exact OEM part numbers for every repair, with model-specific guidance on compatible replacements.",
  },
  {
    icon: "☰",
    title: "Step-by-step repair",
    desc: "Detailed repair procedures with safety warnings, torque specs, and calibration notes — built for technicians, clear enough for homeowners.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Cut my average diagnosis time from 20 minutes to under 3. Dyagno nailed a tricky intermittent fault on a Samsung fridge that had me stumped for days.",
    name: "Marcus T.",
    role: "Appliance Technician, 14 years",
  },
  {
    quote:
      "My washer was throwing an F21 code. Dyagno told me exactly which pressure switch to check and what the resistance values should be. Fixed it myself in an hour.",
    name: "Priya S.",
    role: "Homeowner",
  },
  {
    quote:
      "I run a small repair shop and Dyagno handles the research while I handle the wrenches. My turnaround times are down 40%.",
    name: "Derek O.",
    role: "Owner, QuickFix Appliance Repair",
  },
];

export default function LandingPage() {
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

      <main className="pt-16">
        <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(#EF9F27 1px, transparent 1px), linear-gradient(90deg, #EF9F27 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="relative z-10 text-center max-w-3xl mx-auto space-y-8">
            <div className="flex justify-center">
              <div className="relative inline-flex">
                <DyagnoLogo size={80} variant="dark" />
                <PulseRing />
              </div>
            </div>
            <div className="space-y-4">
              <Badge
                className="font-mono text-xs tracking-widest uppercase bg-dark-carbon border-steel-border text-warm-gold/60"
                variant="outline"
              >
                Appliance Repair Intelligence
              </Badge>
              <h1
                className="text-5xl sm:text-6xl font-bold text-warm-gold leading-tight"
                style={{
                  fontFamily: "var(--font-space-grotesk)",
                  letterSpacing: "-0.03em",
                }}
              >
                <span className="text-forge-amber">Diagnose</span> any appliance
                fault in seconds
              </h1>
              <p className="text-lg text-warm-gold/60 max-w-xl mx-auto leading-relaxed">
                AI-powered diagnosis for professional technicians and homeowners.
                Describe the symptom, upload a photo, get the answer &mdash; complete
                with error codes, part numbers, and repair steps.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-forge-amber text-ink font-bold hover:bg-forge-amber/90 text-base px-8"
                >
                  Start diagnosing &rarr;
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-steel-border text-warm-gold/70 hover:bg-dark-carbon hover:text-warm-gold text-base px-8"
                >
                  View pricing
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-24 px-4 border-t border-steel-border">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2
              className="text-3xl font-bold text-warm-gold"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Three steps to a diagnosis
            </h2>
          </div>
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Describe", desc: "Tell Dyagno the appliance type, model, and the symptoms you're seeing." },
              { step: "02", title: "Upload", desc: "Attach a photo of the error display, damaged part, or installation label." },
              { step: "03", title: "Diagnose", desc: "Receive a precise fault analysis with error codes, parts, and repair steps." },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-3">
                <div className="text-4xl font-bold text-forge-amber/30" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-warm-gold" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  {item.title}
                </h3>
                <p className="text-sm text-warm-gold/50 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-24 px-4 bg-dark-carbon border-t border-steel-border">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-warm-gold" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                Built for real repair work
              </h2>
              <p className="mt-3 text-warm-gold/50">Everything a technician or motivated homeowner needs.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {FEATURES.map((f) => (
                <div key={f.title} className="rounded-xl border border-steel-border bg-dark-chrome p-6 space-y-3">
                  <div className="text-2xl text-forge-amber">{f.icon}</div>
                  <h3 className="text-lg font-bold text-warm-gold" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                    {f.title}
                  </h3>
                  <p className="text-sm text-warm-gold/50 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 px-4 border-t border-steel-border">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-warm-gold" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                Trusted by technicians and homeowners
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="rounded-xl border border-steel-border bg-dark-carbon p-6 space-y-4">
                  <p className="text-sm text-warm-gold/70 leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
                  <div>
                    <p className="text-sm font-semibold text-warm-gold">{t.name}</p>
                    <p className="text-xs text-warm-gold/40">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-dark-carbon border-t border-steel-border">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-4xl font-bold text-warm-gold" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Ready to fix smarter?
            </h2>
            <p className="text-warm-gold/50">Join technicians and homeowners diagnosing appliances with AI.</p>
            <Link href="/signup">
              <Button size="lg" className="bg-forge-amber text-ink font-bold hover:bg-forge-amber/90 text-base px-10">
                Start diagnosing &rarr;
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-steel-border py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <DyagnoLogo size={24} variant="dark" showWordmark />
          <p className="text-xs text-warm-gold/30">&copy; {new Date().getFullYear()} Dyagno. Appliance Repair Intelligence.</p>
          <nav className="flex gap-4 text-xs text-warm-gold/40">
            <Link href="/pricing" className="hover:text-warm-gold/70">Pricing</Link>
            <Link href="/login" className="hover:text-warm-gold/70">Sign in</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}

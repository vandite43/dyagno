import { redirect } from "next/navigation";
import Link from "next/link";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { StockChecklist } from "@/components/stock/StockChecklist";

interface Rec {
  partName: string;
  partNumber: string | null;
  appliance: string | null;
  count: number;
}

export default async function StockPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: sub } = await supabase.from("subscriptions").select("plan").eq("user_id", user.id).single();
  const plan = sub?.plan ?? "trial";
  const allowed = plan === "pro" || plan === "enterprise";

  if (!allowed) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="rounded-2xl border border-steel-border bg-dark-carbon p-10 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-forge-amber/15 border border-forge-amber/30 flex items-center justify-center mx-auto">
            <Lock size={20} className="text-forge-amber" />
          </div>
          <h1 className="text-xl font-bold text-warm-gold" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Stock recommendations
          </h1>
          <p className="text-sm text-warm-gold/50 max-w-sm mx-auto">
            See which parts you diagnose most often so you can keep them in stock. Available on Pro and Enterprise plans.
          </p>
          <Link href="/pricing">
            <Button className="bg-forge-amber text-ink font-semibold hover:bg-forge-amber/90 mt-2">Upgrade to Pro</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Aggregate part mentions (3+ occurrences)
  const { data: rows } = await supabase
    .from("part_mentions")
    .select("part_name, part_number, appliance")
    .eq("user_id", user.id);

  const map = new Map<string, Rec>();
  for (const row of rows ?? []) {
    const key = (row.part_name ?? "").trim().toLowerCase();
    if (!key) continue;
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
      if (!existing.partNumber && row.part_number) existing.partNumber = row.part_number;
    } else {
      map.set(key, { partName: (row.part_name ?? "").trim(), partNumber: row.part_number ?? null, appliance: row.appliance ?? null, count: 1 });
    }
  }
  const recs = [...map.values()].filter((r) => r.count >= 3).sort((a, b) => b.count - a.count);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-warm-gold" style={{ fontFamily: "var(--font-space-grotesk)" }}>
          Stock checklist
        </h1>
        <p className="text-sm text-warm-gold/40 mt-1">Track which repair parts you keep on hand.</p>
      </div>

      <StockChecklist recommendations={recs} />
    </div>
  );
}

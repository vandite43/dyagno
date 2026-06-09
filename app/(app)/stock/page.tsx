import { redirect } from "next/navigation";
import Link from "next/link";
import { Bookmark, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

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
          Stock recommendations
        </h1>
        <p className="text-sm text-warm-gold/40 mt-1">Parts you&apos;ve diagnosed 3 or more times.</p>
      </div>

      {recs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-steel-border bg-dark-carbon p-12 text-center">
          <Bookmark size={28} className="text-warm-gold/20 mx-auto mb-3" />
          <p className="text-warm-gold/40 text-sm">No recurring parts yet. Run more diagnoses and your most-needed parts will appear here.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {recs.map((r, i) => (
            <li key={i} className="flex items-center justify-between gap-4 bg-dark-carbon border border-steel-border rounded-xl px-4 py-3">
              <div className="min-w-0 flex items-center gap-3">
                <Bookmark size={16} className="text-forge-amber shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-warm-gold truncate">
                    {r.partName}
                    {r.partNumber && r.partNumber !== r.partName && (
                      <span className="font-mono text-forge-amber text-xs ml-2">{r.partNumber}</span>
                    )}
                  </p>
                  {r.appliance && <p className="text-xs text-warm-gold/40 mt-0.5">{r.appliance}</p>}
                </div>
              </div>
              <span className="shrink-0 text-xs font-semibold text-forge-amber bg-forge-amber/15 border border-forge-amber/30 rounded-full px-2.5 py-1">
                {r.count}&times;
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

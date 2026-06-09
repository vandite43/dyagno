import { createClient } from "@/lib/supabase/server";

interface Recommendation {
  partName: string;
  partNumber: string | null;
  appliance: string | null;
  count: number;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("part_mentions")
    .select("part_name, part_number, appliance")
    .eq("user_id", user.id);

  if (error) {
    // Table may not exist yet (migration not run) — return empty list, not an error
    console.error("Part mentions query failed:", error.message);
    return Response.json({ recommendations: [] });
  }

  // Aggregate by normalized part name
  const map = new Map<string, Recommendation>();
  for (const row of data ?? []) {
    const key = (row.part_name ?? "").trim().toLowerCase();
    if (!key) continue;
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
      if (!existing.partNumber && row.part_number) existing.partNumber = row.part_number;
    } else {
      map.set(key, {
        partName: (row.part_name ?? "").trim(),
        partNumber: row.part_number ?? null,
        appliance: row.appliance ?? null,
        count: 1,
      });
    }
  }

  const recommendations = [...map.values()]
    .filter((r) => r.count >= 3)
    .sort((a, b) => b.count - a.count);

  return Response.json({ recommendations });
}

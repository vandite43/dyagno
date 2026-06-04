import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DiagnosisList } from "./DiagnosisList";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: sub } = await supabase.from("subscriptions").select("plan").eq("user_id", user.id).single();
  const plan = sub?.plan ?? "trial";

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const canSearch = plan === "pro" || plan === "enterprise";

  let query = supabase.from("conversations")
    .select("id, title, appliance_type, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (plan === "single") {
    query = query.limit(0);
  } else if (plan === "starter" || plan === "trial") {
    query = query.gte("created_at", thirtyDaysAgo).limit(50);
  } else {
    query = query.limit(100);
  }

  const { data: conversations } = await query;

  return <DiagnosisList initialConversations={conversations ?? []} plan={plan} canSearch={canSearch} />;
}

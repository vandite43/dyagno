import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DiagnosisList } from "./DiagnosisList";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, title, appliance_type, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(50);

  return <DiagnosisList initialConversations={conversations ?? []} />;
}

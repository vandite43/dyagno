import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Generate a share token (Pro / Enterprise only)
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Verify plan
  const { data: sub } = await supabase.from("subscriptions").select("plan").eq("user_id", user.id).single();
  const plan = sub?.plan ?? "trial";
  if (plan !== "pro" && plan !== "enterprise") {
    return Response.json({ error: "Sharing is available on Pro and Enterprise plans." }, { status: 403 });
  }

  // Verify ownership
  const { data: convo } = await supabase.from("conversations").select("id, share_token").eq("id", id).eq("user_id", user.id).single();
  if (!convo) return Response.json({ error: "Not found" }, { status: 404 });

  const token = convo.share_token ?? crypto.randomUUID();
  const { error } = await supabase.from("conversations").update({ share_token: token }).eq("id", id).eq("user_id", user.id);
  if (error) {
    console.error("Share token save failed:", error.message);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }

  return Response.json({ token });
}

// Revoke a share token
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase.from("conversations").update({ share_token: null }).eq("id", id).eq("user_id", user.id);
  if (error) {
    console.error("Share token revoke failed:", error.message);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }

  return Response.json({ ok: true });
}

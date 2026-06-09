import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: messageId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const value = body.value === 1 || body.value === -1 ? body.value : null;
  if (value === null) return Response.json({ error: "Invalid value" }, { status: 400 });

  // Upsert by unique messageId
  const { error } = await supabase
    .from("message_feedback")
    .upsert(
      { message_id: messageId, user_id: user.id, value },
      { onConflict: "message_id" }
    );

  if (error) {
    console.error("Feedback save failed:", error.message);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }

  return Response.json({ ok: true });
}

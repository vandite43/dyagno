import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify ownership
  const { data: convo } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!convo) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Delete messages first to avoid cascade RLS issues
  const { error: msgError } = await supabase
    .from("messages")
    .delete()
    .eq("conversation_id", id);

  if (msgError) {
    console.error("Failed to delete messages:", msgError.message);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  // Now delete the conversation
  const { error: convoError } = await supabase
    .from("conversations")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (convoError) {
    console.error("Failed to delete conversation:", convoError.message);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

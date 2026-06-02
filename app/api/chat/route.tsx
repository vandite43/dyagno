import { streamText, convertToModelMessages } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { createClient } from "@/lib/supabase/server";
import { DYAGNO_SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const rawMessages = Array.isArray(body.messages) ? body.messages.slice(0, 50) : [];
  const conversationId = typeof body.conversationId === "string" ? body.conversationId : null;

  // Validate conversationId belongs to the user
  if (conversationId) {
    const { data: convo } = await supabase.from("conversations").select("id").eq("id", conversationId).eq("user_id", user.id).single();
    if (!convo) return new Response("Forbidden", { status: 403 });
  }

  // Truncate individual message text parts to prevent token abuse
  const messages = rawMessages.map((m: { role: string; parts?: { type: string; text?: string }[]; content?: string }) => ({
    ...m,
    parts: m.parts?.map((p: { type: string; text?: string }) =>
      p.type === "text" && typeof p.text === "string" ? { ...p, text: p.text.slice(0, 4000) } : p
    ),
  }));

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: DYAGNO_SYSTEM_PROMPT,

    messages: await convertToModelMessages(messages),
    onFinish: async ({ text }) => {
      if (!conversationId) return;
      // Persist assistant message
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        role: "assistant",
        content: text,
      });
      // Update conversation timestamp
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);
    },
  });

  return result.toUIMessageStreamResponse();
}

import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { createClient } from "@/lib/supabase/server";
import { DYAGNO_SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import type { NextRequest } from "next/server";

type TextPart = { type: "text"; text: string };
type ImagePart = { type: "image"; image: string; mimeType?: string };
type ContentPart = TextPart | ImagePart;

function buildMessages(rawMessages: any[]): { role: "user" | "assistant"; content: string | ContentPart[] }[] {
  return rawMessages.slice(0, 50).map((msg) => {
    const parts: any[] = msg.parts ?? [];

    if (parts.length === 0) {
      return { role: msg.role as "user" | "assistant", content: String(msg.content ?? "") };
    }

    const blocks: ContentPart[] = [];

    for (const part of parts) {
      if (part.type === "text" && typeof part.text === "string") {
        const text = part.text.slice(0, 4000);
        if (text) blocks.push({ type: "text", text });
      } else if (part.type === "file" && typeof part.url === "string") {
        const mimeMatch = part.url.match(/^data:([^;]+);/);
        const mimeType = mimeMatch?.[1] ?? part.mediaType ?? "image/jpeg";
        // Pass the full data URL — the AI SDK handles base64 extraction
        blocks.push({ type: "image", image: part.url, mimeType });
      }
    }

    if (blocks.length === 0) return null as any;
    if (blocks.length === 1 && blocks[0].type === "text") {
      return { role: msg.role as "user" | "assistant", content: (blocks[0] as TextPart).text };
    }

    return { role: msg.role as "user" | "assistant", content: blocks };
  }).filter(Boolean);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();
  const rawMessages = Array.isArray(body.messages) ? body.messages : [];
  const conversationId = typeof body.conversationId === "string" ? body.conversationId : null;

  if (conversationId) {
    const { data: convo } = await supabase.from("conversations").select("id").eq("id", conversationId).eq("user_id", user.id).single();
    if (!convo) return new Response("Forbidden", { status: 403 });
  }

  const messages = buildMessages(rawMessages);
  if (messages.length === 0) return new Response("No messages", { status: 400 });

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: DYAGNO_SYSTEM_PROMPT,
    messages: messages as any,
    onFinish: async ({ text }) => {
      if (!conversationId) return;
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        role: "assistant",
        content: text,
      });
      await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);
    },
  });

  return result.toUIMessageStreamResponse();
}

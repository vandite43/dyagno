import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { createClient } from "@/lib/supabase/server";
import { DYAGNO_SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import type { NextRequest } from "next/server";

type ContentBlock =
  | { type: "text"; text: string }
  | { type: "image"; source: { type: "base64"; mediaType: string; data: string } | { type: "url"; url: string } };

function buildMessages(rawMessages: any[]): { role: "user" | "assistant"; content: string | ContentBlock[] }[] {
  return rawMessages.slice(0, 50).map((msg) => {
    const parts: any[] = msg.parts ?? [];

    if (parts.length === 0) {
      return { role: msg.role as "user" | "assistant", content: String(msg.content ?? "") };
    }

    const blocks: ContentBlock[] = [];

    for (const part of parts) {
      if (part.type === "text" && typeof part.text === "string") {
        const text = part.text.slice(0, 4000);
        if (text) blocks.push({ type: "text", text });
      } else if (part.type === "file" && typeof part.url === "string") {
        // Data URL — extract base64 directly
        const match = part.url.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          blocks.push({
            type: "image",
            source: { type: "base64", mediaType: match[1], data: match[2] },
          });
        } else if (part.url.startsWith("http")) {
          blocks.push({ type: "image", source: { type: "url", url: part.url } });
        }
      }
    }

    if (blocks.length === 0) return null as any;
    if (blocks.length === 1 && blocks[0].type === "text") {
      return { role: msg.role as "user" | "assistant", content: blocks[0].text };
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

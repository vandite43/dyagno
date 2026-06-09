import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { createClient } from "@/lib/supabase/server";
import { DYAGNO_SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import { parsePartMentions } from "@/lib/parse-parts";
import type { NextRequest } from "next/server";

type TextPart = { type: "text"; text: string };
type ImagePart = { type: "image"; image: string; mimeType?: string };
type ContentPart = TextPart | ImagePart;

function buildMessages(rawMessages: any[]): { role: "user" | "assistant"; content: string | ContentPart[] }[] {
  return rawMessages.slice(0, 50).map((msg) => {
    const parts: any[] = msg.parts ?? [];
    if (parts.length === 0) return { role: msg.role as "user" | "assistant", content: String(msg.content ?? "") };

    const blocks: ContentPart[] = [];
    for (const part of parts) {
      if (part.type === "text" && typeof part.text === "string") {
        const text = part.text.slice(0, 4000);
        if (text) blocks.push({ type: "text", text });
      } else if (part.type === "file" && typeof part.url === "string") {
        const mimeMatch = part.url.match(/^data:([^;]+);/);
        const mimeType = mimeMatch?.[1] ?? part.mediaType ?? "image/jpeg";
        blocks.push({ type: "image", image: part.url, mimeType });
      }
    }

    if (blocks.length === 0) return null as any;
    if (blocks.length === 1 && blocks[0].type === "text") return { role: msg.role as "user" | "assistant", content: (blocks[0] as TextPart).text };
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

  // Fetch subscription plan for feature gating + appliance for part tracking
  const { data: sub } = await supabase.from("subscriptions").select("plan, is_one_time").eq("user_id", user.id).single();
  const plan = sub?.plan ?? "trial";

  let appliance: string | null = null;
  if (conversationId) {
    const { data: c } = await supabase.from("conversations").select("appliance_type").eq("id", conversationId).single();
    appliance = c?.appliance_type ?? null;
  }

  // Count image parts in the latest user message
  const latestMsg = rawMessages[rawMessages.length - 1];
  const latestParts: any[] = latestMsg?.parts ?? [];
  const incomingPhotos = latestParts.filter((p: any) => p.type === "file").length;

  if (incomingPhotos > 0) {
    if (plan === "single") {
      return new Response("Photo uploads are not available on the Single plan.", { status: 403 });
    }
    // Starter only — trial users get Pro-level (unlimited) access
    if (plan === "starter") {
      const { data: convData } = await supabase.from("conversations").select("photos_uploaded").eq("id", conversationId ?? "").single();
      const used = convData?.photos_uploaded ?? 0;
      if (used + incomingPhotos > 3) {
        return new Response("Photo limit reached for this session (3 max on Starter).", { status: 403 });
      }
    }
  }

  const messages = buildMessages(rawMessages);
  if (messages.length === 0) return new Response("No messages", { status: 400 });

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: DYAGNO_SYSTEM_PROMPT,
    messages: messages as any,
    onFinish: async ({ text }) => {
      if (!conversationId) return;
      await supabase.from("messages").insert({ conversation_id: conversationId, role: "assistant", content: text });
      await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);

      // Parse part mentions and record them (best-effort — table may not exist yet)
      const parts = parsePartMentions(text);
      if (parts.length > 0) {
        await supabase.from("part_mentions").insert(
          parts.map((p) => ({
            user_id: user.id,
            session_id: conversationId,
            part_name: p.partName,
            part_number: p.partNumber,
            appliance,
          }))
        );
      }

      // Track photos for Starter only
      if (incomingPhotos > 0 && plan === "starter") {
        const { data: convData } = await supabase.from("conversations").select("photos_uploaded").eq("id", conversationId).single();
        const used = convData?.photos_uploaded ?? 0;
        await supabase.from("conversations").update({ photos_uploaded: used + incomingPhotos }).eq("id", conversationId);
      }
    },
  });

  return result.toUIMessageStreamResponse();
}

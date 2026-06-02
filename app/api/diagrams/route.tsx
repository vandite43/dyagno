import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { createClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";

const DIAGRAMS_SYSTEM_PROMPT = `You are an appliance parts expert. Given a model number, identify the appliance and describe what parts diagrams the user will find on Sears PartsDirect.

Respond concisely in this structure:
1. Brand and appliance type (e.g. "Whirlpool top-load washer")
2. Model series name if known
3. List the diagram sections they will find on PartsDirect (e.g. Cabinet & Top Panel, Motor & Drive Components, Control Panel & Timer, etc.)
4. Note any important sections for common repairs on this model

Keep the response short and practical. Do not include URLs — the link is already shown to the user.`;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();
  const modelNumber = typeof body.modelNumber === "string" ? body.modelNumber.slice(0, 50).trim() : "";
  if (!modelNumber) return new Response("No model number provided", { status: 400 });

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: DIAGRAMS_SYSTEM_PROMPT,

    messages: [{ role: "user", content: `Model number: ${modelNumber}` }],
  });

  return result.toTextStreamResponse();
}

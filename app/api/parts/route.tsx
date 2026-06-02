import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { createClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";

const PARTS_SYSTEM_PROMPT = `You are an appliance parts specialist. Given a model number and/or symptom, identify the specific replacement parts needed.

For each part, use EXACTLY this format on a single line:
PART: WP12345678 - Part name and one-line description of its function

Example:
PART: WP35001191 - Door latch assembly, primary cause of door not latching on Whirlpool dishwashers
PART: W10195416 - Drain pump motor, fails when dishwasher stops mid-cycle with standing water

Rules:
- The part number and description MUST be on the same line after "PART:"
- Use a dash ( - ) to separate the number from the description
- List the most likely parts first
- If you recognize the model number, start with the brand and appliance series
- Be concise and specific with part numbers — use real OEM numbers`;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();
  const modelNumber = typeof body.modelNumber === "string" ? body.modelNumber.slice(0, 50) : "";
  const symptom = typeof body.symptom === "string" ? body.symptom.slice(0, 500) : "";
  const applianceType = typeof body.applianceType === "string" ? body.applianceType.slice(0, 100) : "";

  const userMessage = [
    applianceType && `Appliance: ${applianceType}`,
    modelNumber && `Model number: ${modelNumber}`,
    symptom && `Symptom / issue: ${symptom}`,
  ].filter(Boolean).join("\n");

  if (!userMessage) return new Response("No input provided", { status: 400 });

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: PARTS_SYSTEM_PROMPT,

    messages: [{ role: "user", content: userMessage }],
  });

  return result.toTextStreamResponse();
}

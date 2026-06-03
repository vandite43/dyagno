import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { createClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";

const PARTS_SYSTEM_PROMPT = `You are an appliance repair expert. Given a model number and/or symptom, identify the parts most likely to be causing the issue.

Do NOT generate or guess OEM part numbers — they will be looked up on real parts sites. Instead, identify parts by their standard name.

For each part, use EXACTLY this format on a single line:
PART: [Standard part name] - [One sentence explaining why this part causes the reported symptom]

Example:
PART: Door latch assembly - Prevents the door from staying closed during the cycle, triggering mid-cycle stops
PART: Drain pump motor - Responsible for expelling water; fails when dishwasher leaves standing water after a cycle
PART: Door gasket - Worn seal allows steam and water to escape, causing leaks around the door

Rules:
- Use the standard industry name for the part (e.g. "control board", "door latch assembly", "drain pump motor")
- The part name and description MUST be on the same line after "PART:"
- List parts in order of likelihood — most probable cause first
- Maximum 5 parts
- If you recognize the model number, briefly identify the brand and appliance type first
- Be specific to the symptom described — do not list generic parts`;

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

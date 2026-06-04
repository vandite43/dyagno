import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { company_name, team_size, email, message } = body;

  if (!company_name?.trim() || !team_size?.trim() || !email?.trim()) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("enterprise_inquiries").insert({
    company_name: company_name.trim(),
    team_size: team_size.trim(),
    email: email.trim(),
    message: message?.trim() ?? null,
  });

  if (error) {
    console.error("Enterprise inquiry insert failed:", error.message);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }

  return Response.json({ ok: true });
}

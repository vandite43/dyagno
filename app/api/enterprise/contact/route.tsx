import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { company_name, team_size, email, message } = body;

  if (!company_name?.trim() || !team_size?.trim() || !email?.trim()) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Save to DB
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

  // Send notification email
  if (process.env.RESEND_API_KEY && process.env.ENTERPRISE_NOTIFY_EMAIL) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Dyagno <onboarding@resend.dev>",
        to: process.env.ENTERPRISE_NOTIFY_EMAIL,
        subject: `New Enterprise inquiry — ${company_name.trim()}`,
        html: `
          <h2>New Enterprise inquiry</h2>
          <table style="border-collapse:collapse;width:100%;max-width:500px">
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Company</td><td style="padding:8px;border-bottom:1px solid #eee">${company_name.trim()}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Team size</td><td style="padding:8px;border-bottom:1px solid #eee">${team_size.trim()}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Email</td><td style="padding:8px;border-bottom:1px solid #eee"><a href="mailto:${email.trim()}">${email.trim()}</a></td></tr>
            <tr><td style="padding:8px;font-weight:bold">Message</td><td style="padding:8px">${message?.trim() || "—"}</td></tr>
          </table>
        `,
      });
    } catch (emailErr) {
      console.error("Enterprise notification email failed:", emailErr);
      // Don't fail the request if email fails — inquiry is already saved
    }
  }

  return Response.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/pricing";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/pricing";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Upsert profile row on first OAuth login
      await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          full_name: data.user.user_metadata?.full_name ?? null,
          avatar_url: data.user.user_metadata?.avatar_url ?? null,
        },
        { onConflict: "id", ignoreDuplicates: true }
      );

      return NextResponse.redirect(new URL(next, origin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth_failed", origin));
}

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // Redirect to the landing page on the same origin the request came from,
  // so domain-scoped auth cookies stay consistent.
  // Status 303 forces the redirect to a GET (default 307 would re-POST → 405).
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}

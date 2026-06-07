import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // Redirect to the login page on the same origin the request came from,
  // so domain-scoped auth cookies stay consistent.
  return NextResponse.redirect(new URL("/login", request.url));
}

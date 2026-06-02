import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = ["/", "/pricing", "/login", "/signup"];
const AUTH_PATHS = ["/login", "/signup"];

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith("/auth/")) return true;
  if (pathname.startsWith("/_next/")) return true;
  if (pathname.startsWith("/api/stripe/webhook")) return true;
  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If Supabase isn't configured, allow public paths and redirect others to login
  let supabaseResponse = NextResponse.next({ request });
  let user: { id: string; created_at: string } | null = null;
  let supabase: Awaited<ReturnType<typeof updateSession>>["supabase"] | null = null;

  try {
    const session = await updateSession(request);
    supabaseResponse = session.supabaseResponse;
    user = session.user;
    supabase = session.supabase;
  } catch (err) {
    console.error("Middleware: Supabase session error:", err);
    if (isPublic(pathname)) return NextResponse.next({ request });
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && AUTH_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isPublic(pathname)) return supabaseResponse;

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 7-day free trial — allow access if account is less than 7 days old
  const createdAt = new Date(user.created_at);
  const trialEndsAt = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
  const inTrial = new Date() < trialEndsAt;

  if (!inTrial && supabase) {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .single();
    const activeStatuses = ["active", "trialing"];
    const hasActiveSubscription = subscription && activeStatuses.includes(subscription.status);
    if (!hasActiveSubscription) return NextResponse.redirect(new URL("/pricing", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

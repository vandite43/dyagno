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
  const { supabaseResponse, user, supabase } = await updateSession(request);

  if (user && AUTH_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isPublic(pathname)) return supabaseResponse;

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Stripe billing disabled — uncomment below to re-enable subscription gate
  // const { data: subscription } = await supabase
  //   .from("subscriptions")
  //   .select("status")
  //   .eq("user_id", user.id)
  //   .single();
  // const activeStatuses = ["active", "trialing"];
  // const hasActiveSubscription = subscription && activeStatuses.includes(subscription.status);
  // if (!hasActiveSubscription) return NextResponse.redirect(new URL("/pricing", request.url));

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

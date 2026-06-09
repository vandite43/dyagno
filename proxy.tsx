import { NextResponse, type NextRequest } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = ["/", "/pricing", "/login", "/signup"];
const AUTH_PATHS = ["/login", "/signup"];

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith("/auth/")) return true;
  if (pathname.startsWith("/share/")) return true;
  if (pathname.startsWith("/_next/")) return true;
  if (pathname.startsWith("/api/stripe/webhook")) return true;
  if (pathname.startsWith("/api/enterprise/contact")) return true;
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

  if (!inTrial) {
    // Read subscriptions with the service-role key so the gate is not affected
    // by Row Level Security on the subscriptions table.
    const service = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch all subscription rows (table may have duplicates — no unique
    // constraint on user_id), then check if ANY of them is active.
    const { data: subs, error: subErr } = await service
      .from("subscriptions")
      .select("status, plan, is_one_time")
      .eq("user_id", user.id);

    const activeStatuses = ["active", "trialing"];
    const activeSub = (subs ?? []).find((s) => activeStatuses.includes(s.status));
    if (!activeSub) {
      console.error("GATE_DEBUG", JSON.stringify({
        userId: user.id,
        path: pathname,
        subsCount: subs?.length ?? null,
        subs,
        subErr: subErr?.message ?? null,
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      }));
      return NextResponse.redirect(new URL("/?trial=expired", request.url));
    }

    // Single plan: redirect if their one session has expired
    if (activeSub.plan === "single" && activeSub.is_one_time) {
      const { data: convs } = await service
        .from("conversations")
        .select("expires_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);
      const conv = convs?.[0];
      if (conv?.expires_at && new Date(conv.expires_at) < new Date()) {
        return NextResponse.redirect(new URL("/?trial=expired", request.url));
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

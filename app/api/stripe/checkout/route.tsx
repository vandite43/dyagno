import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { priceId } = await req.json();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const session = await getStripe().checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { userId: user.id },
    success_url: `${appUrl}/dashboard?subscription=success`,
    cancel_url: `${appUrl}/pricing`,
  });

  return NextResponse.json({ url: session.url });
}

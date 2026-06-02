import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient as createServerClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Use service role key for privileged DB writes
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription") break;

      const userId = session.metadata?.userId;
      if (!userId) break;

      const subscription = await getStripe().subscriptions.retrieve(
        session.subscription as string
      );
      const item = subscription.items.data[0];

      await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscription.id,
          plan: getPlanName(item.price.id),
          status: subscription.status,
          current_period_end: new Date(
            item.current_period_end * 1000
          ).toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const { data: existing } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("stripe_subscription_id", sub.id)
        .single();

      if (existing) {
        await supabase
          .from("subscriptions")
          .update({
            status: sub.status,
            plan: getPlanName(sub.items.data[0].price.id),
            current_period_end: new Date(
              sub.items.data[0].current_period_end * 1000
            ).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", sub.id);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await supabase
        .from("subscriptions")
        .update({ status: "canceled", updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", sub.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}

function getPlanName(priceId: string): string {
  const starterIds = [
    process.env.STRIPE_STARTER_MONTHLY_PRICE_ID,
    process.env.STRIPE_STARTER_YEARLY_PRICE_ID,
  ];
  const proIds = [
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    process.env.STRIPE_PRO_YEARLY_PRICE_ID,
  ];
  if (starterIds.includes(priceId)) return "starter";
  if (proIds.includes(priceId)) return "pro";
  throw new Error(`Unknown price ID: ${priceId}`);
}

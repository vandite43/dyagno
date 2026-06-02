import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BillingSection } from "./BillingSection";
import { Separator } from "@/components/ui/separator";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status, current_period_end, stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-10">
      <h1
        className="text-2xl font-bold text-warm-gold"
        style={{ fontFamily: "var(--font-space-grotesk)" }}
      >
        Settings
      </h1>

      {/* Account section */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-warm-gold/50 uppercase tracking-wider">
          Account
        </h2>
        <div className="rounded-xl border border-steel-border bg-dark-carbon p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-warm-gold/40 text-xs mb-1">Name</p>
              <p className="text-warm-gold">{profile?.full_name ?? "—"}</p>
            </div>
            <div>
              <p className="text-warm-gold/40 text-xs mb-1">Email</p>
              <p className="text-warm-gold">{user.email}</p>
            </div>
          </div>
        </div>
      </section>

      <Separator className="bg-steel-border" />

      {/* Billing section */}
      <BillingSection subscription={sub} />

      <Separator className="bg-steel-border" />

      {/* Danger zone */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-red-400/70 uppercase tracking-wider">
          Danger zone
        </h2>
        <div className="rounded-xl border border-red-900/40 bg-dark-carbon p-6 space-y-3">
          <p className="text-sm text-warm-gold/50">
            Deleting your account will cancel your subscription and permanently
            remove all your data.
          </p>
          <form action="/api/account/delete" method="POST">
            <button
              type="submit"
              className="text-sm text-red-400 hover:text-red-300 underline underline-offset-4"
            >
              Delete account
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

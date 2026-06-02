"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

const APPLIANCES = [
  { id: "refrigerator",  label: "Refrigerator",    icon: "🧊" },
  { id: "washer",        label: "Washer",           icon: "🫧" },
  { id: "dryer",         label: "Dryer",            icon: "♨️" },
  { id: "dishwasher",    label: "Dishwasher",       icon: "🍽️" },
  { id: "oven",          label: "Oven / Range",     icon: "🔥" },
  { id: "microwave",     label: "Microwave",        icon: "📡" },
  { id: "hvac",          label: "HVAC / Heat Pump", icon: "🌡️" },
  { id: "freezer",       label: "Freezer",          icon: "❄️" },
  { id: "ice-maker",     label: "Ice Maker",        icon: "🧊" },
  { id: "garbage-disposal", label: "Disposal",     icon: "⚙️" },
  { id: "water-heater",  label: "Water Heater",     icon: "💧" },
  { id: "other",         label: "Other",            icon: "🔧" },
];

export default function NewChatPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSelect(applianceId: string, applianceLabel: string) {
    setLoading(applianceId);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("conversations")
      .insert({ user_id: user.id, title: null, appliance_type: applianceLabel })
      .select("id")
      .single();

    if (data) {
      router.replace(`/chat/${data.id}`);
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1
            className="text-2xl font-bold text-warm-gold"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            What are you diagnosing?
          </h1>
          <p className="text-warm-gold/50 text-sm">Select the appliance to get started</p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {APPLIANCES.map((a) => (
            <button
              key={a.id}
              onClick={() => handleSelect(a.id, a.label)}
              disabled={loading !== null}
              className={`
                relative flex flex-col items-center gap-2 rounded-xl border px-3 py-4
                transition-all duration-150 text-center
                ${loading === a.id
                  ? "border-forge-amber bg-forge-amber/10 scale-95"
                  : "border-steel-border bg-dark-carbon hover:border-forge-amber/60 hover:bg-dark-carbon/80 hover:scale-[1.02]"
                }
                disabled:pointer-events-none disabled:opacity-60
              `}
            >
              <span className="text-2xl leading-none">{a.icon}</span>
              <span className="text-xs font-medium text-warm-gold/80 leading-tight">{a.label}</span>
              {loading === a.id && (
                <div className="absolute inset-x-0 bottom-0 h-0.5 rounded-b-xl overflow-hidden">
                  <div className="dyagno-scan-bar w-full" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

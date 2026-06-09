"use client";

import { useEffect, useState } from "react";
import { Bookmark, Check } from "lucide-react";
import { COMMON_STOCK_PARTS } from "@/lib/common-stock-parts";

interface Rec {
  partName: string;
  partNumber: string | null;
  appliance: string | null;
  count: number;
}

const STORAGE_KEY = "dyagno-stock-checklist";

export function StockChecklist({ recommendations }: { recommendations: Rec[] }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  // Load saved checklist state from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setChecked(JSON.parse(raw));
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  // Persist whenever it changes (after initial load)
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
    } catch {
      // ignore
    }
  }, [checked, loaded]);

  function toggle(key: string) {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  // Count total / stocked across curated list
  const allCuratedKeys = COMMON_STOCK_PARTS.flatMap((c) => c.parts.map((p) => `${c.category}:${p.name}`));
  const stockedCount = allCuratedKeys.filter((k) => checked[k]).length;

  return (
    <div className="space-y-8">
      {/* Your recurring parts */}
      {recommendations.length > 0 && (
        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-warm-gold uppercase tracking-wider">Your most-diagnosed parts</h2>
            <p className="text-xs text-warm-gold/40 mt-1">Parts you&apos;ve diagnosed 3 or more times — tick what you keep stocked.</p>
          </div>
          <ul className="space-y-2">
            {recommendations.map((r, i) => {
              const key = `rec:${r.partName.toLowerCase()}`;
              return (
                <ChecklistRow
                  key={i}
                  checked={!!checked[key]}
                  onToggle={() => toggle(key)}
                  title={r.partName}
                  subtitle={r.appliance ?? undefined}
                  badge={`${r.count}×`}
                />
              );
            })}
          </ul>
        </section>
      )}

      {/* Curated common parts checklist */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-warm-gold uppercase tracking-wider">Common parts to keep stocked</h2>
            <p className="text-xs text-warm-gold/40 mt-1">The parts technicians replace most often. Check off what you have on hand.</p>
          </div>
          <span className="shrink-0 text-xs font-semibold text-forge-amber bg-forge-amber/15 border border-forge-amber/30 rounded-full px-2.5 py-1">
            {stockedCount}/{allCuratedKeys.length}
          </span>
        </div>

        {COMMON_STOCK_PARTS.map((cat) => (
          <div key={cat.category} className="space-y-2">
            <p className="text-xs font-semibold text-warm-gold/60">{cat.category}</p>
            <ul className="space-y-2">
              {cat.parts.map((p) => {
                const key = `${cat.category}:${p.name}`;
                return (
                  <ChecklistRow
                    key={key}
                    checked={!!checked[key]}
                    onToggle={() => toggle(key)}
                    title={p.name}
                    subtitle={p.note}
                  />
                );
              })}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}

function ChecklistRow({
  checked,
  onToggle,
  title,
  subtitle,
  badge,
}: {
  checked: boolean;
  onToggle: () => void;
  title: string;
  subtitle?: string;
  badge?: string;
}) {
  return (
    <li>
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
          checked
            ? "border-forge-amber/40 bg-forge-amber/10"
            : "border-steel-border bg-dark-carbon hover:border-forge-amber/40"
        }`}
      >
        <span
          className={`shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
            checked ? "bg-forge-amber border-forge-amber" : "border-steel-border bg-dark-chrome"
          }`}
        >
          {checked && <Check size={13} className="text-ink" strokeWidth={3} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-medium ${checked ? "text-warm-gold" : "text-warm-gold/90"}`}>{title}</p>
          {subtitle && <p className="text-xs text-warm-gold/40 mt-0.5">{subtitle}</p>}
        </div>
        {badge && (
          <span className="shrink-0 text-xs font-semibold text-forge-amber bg-forge-amber/15 border border-forge-amber/30 rounded-full px-2 py-0.5">
            {badge}
          </span>
        )}
        {checked && !badge && <Bookmark size={14} className="text-forge-amber shrink-0" />}
      </button>
    </li>
  );
}

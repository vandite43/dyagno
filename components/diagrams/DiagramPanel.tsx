"use client";

import { useState, useRef } from "react";
import { Search, ExternalLink, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DiagramPanel() {
  const [modelNumber, setModelNumber] = useState("");
  const [submittedModel, setSubmittedModel] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const model = modelNumber.trim();
    if (!model) return;

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setSubmittedModel(model);
    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/diagrams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelNumber: model }),
        signal: ctrl.signal,
      });

      if (!res.ok || !res.body) { setLoading(false); return; }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setResponse(full);
      }
    } catch {}

    setLoading(false);
  }

  const partsDirectUrl = submittedModel
    ? `https://www.searspartsdirect.com/search?q=${encodeURIComponent(submittedModel)}`
    : null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search form */}
      <div className="border-b border-steel-border bg-dark-carbon px-6 py-5 shrink-0">
        <h2 className="text-base font-semibold text-warm-gold mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
          Parts Diagrams
        </h2>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 sm:items-end">
          <div className="space-y-1.5 flex-1">
            <Label className="text-xs text-warm-gold/60">Model Number</Label>
            <Input
              value={modelNumber}
              onChange={(e) => setModelNumber(e.target.value)}
              placeholder="e.g. WDT780SAEM1"
              className="bg-dark-chrome border-steel-border text-warm-gold placeholder:text-warm-gold/25 h-11 text-sm focus-visible:ring-forge-amber"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !modelNumber.trim()}
            className="bg-forge-amber text-ink font-semibold hover:bg-forge-amber/90 h-11 w-full sm:w-auto shrink-0 gap-1.5 disabled:opacity-40"
          >
            <Search size={14} />
            {loading ? "Looking up..." : "Find Diagrams"}
          </Button>
        </form>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {!submittedModel && (
          <div className="flex items-center justify-center h-full text-center px-6">
            <div className="space-y-4">
              <div className="flex justify-center">
                <svg width="192" height="192" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-25">
                  {/* Central component box */}
                  <rect x="20" y="20" width="24" height="24" rx="2" stroke="#EF9F27" strokeWidth="2"/>
                  {/* Internal detail lines */}
                  <line x1="24" y1="28" x2="40" y2="28" stroke="#EF9F27" strokeWidth="1.2"/>
                  <line x1="24" y1="33" x2="37" y2="33" stroke="#EF9F27" strokeWidth="1.2"/>
                  <line x1="24" y1="38" x2="35" y2="38" stroke="#EF9F27" strokeWidth="1.2"/>
                  {/* Exploded leader lines (dashed) */}
                  <line x1="32" y1="20" x2="32" y2="10" stroke="#EF9F27" strokeWidth="1" strokeDasharray="2 1.5"/>
                  <line x1="44" y1="32" x2="54" y2="32" stroke="#EF9F27" strokeWidth="1" strokeDasharray="2 1.5"/>
                  <line x1="32" y1="44" x2="32" y2="54" stroke="#EF9F27" strokeWidth="1" strokeDasharray="2 1.5"/>
                  <line x1="20" y1="32" x2="10" y2="32" stroke="#EF9F27" strokeWidth="1" strokeDasharray="2 1.5"/>
                  {/* Callout boxes */}
                  <rect x="28" y="4" width="8" height="7" rx="1" stroke="#EF9F27" strokeWidth="1.5"/>
                  <rect x="54" y="28" width="8" height="7" rx="1" stroke="#EF9F27" strokeWidth="1.5"/>
                  <rect x="28" y="53" width="8" height="7" rx="1" stroke="#EF9F27" strokeWidth="1.5"/>
                  <rect x="2" y="28" width="8" height="7" rx="1" stroke="#EF9F27" strokeWidth="1.5"/>
                </svg>
              </div>
              <div className="space-y-2">
                <p className="text-warm-gold/50 text-2xl font-medium">Enter a model number to find parts diagrams</p>
                <p className="text-warm-gold/30 text-base">Diagrams open on Sears PartsDirect &mdash; the largest appliance parts diagram library</p>
              </div>
            </div>
          </div>
        )}

        {submittedModel && (
          <div className="px-6 py-5 space-y-5">
            {/* PartsDirect link card */}
            <a
              href={partsDirectUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-4 rounded-xl border border-forge-amber/40 bg-forge-amber/10 hover:bg-forge-amber/20 hover:border-forge-amber/70 transition-colors px-5 py-4 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-forge-amber/20 border border-forge-amber/30 flex items-center justify-center shrink-0">
                  <BookOpen size={16} className="text-forge-amber" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-warm-gold">View Parts Diagrams</p>
                  <p className="text-xs text-warm-gold/50 truncate">
                    searspartsdirect.com/search?q={submittedModel}
                  </p>
                </div>
              </div>
              <ExternalLink size={15} className="text-forge-amber/60 group-hover:text-forge-amber shrink-0 transition-colors" />
            </a>

            {/* AI context */}
            {(response || loading) && (
              <div className="space-y-2">
                <p className="text-xs text-warm-gold/40 font-semibold uppercase tracking-wider">Model Info</p>
                <p className="text-sm text-warm-gold/80 whitespace-pre-wrap leading-relaxed">
                  {response}
                  {loading && <span className="inline-block w-1.5 h-3.5 bg-forge-amber ml-0.5 animate-pulse align-middle" />}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

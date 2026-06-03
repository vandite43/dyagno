"use client";

import { useState, useRef } from "react";
import { Search, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PartLookupPanelProps {
  applianceType: string | null;
}

interface PartResult {
  name: string;
  description: string;
}

function extractParts(text: string): PartResult[] {
  const matches = [...text.matchAll(/PART:\s*([^\n\-–]+?)(?:\s*[-–]\s*([^\n]+))?$/gm)];
  return matches.map((m) => ({ name: m[1].trim(), description: m[2]?.trim() ?? "" }));
}

function partLinks(partName: string, modelNumber: string) {
  const q = encodeURIComponent(modelNumber ? `${modelNumber} ${partName}` : partName);
  const partQ = encodeURIComponent(partName);
  return [
    {
      label: "RepairClinic",
      href: `https://www.repairclinic.com/Shop-For-Parts?query=${q}`,
    },
    {
      label: "Sears Parts Direct",
      href: `https://www.searspartsdirect.com/search?q=${q}`,
    },
    {
      label: "AppliancePartsPros",
      href: `https://www.appliancepartspros.com/search?q=${q}`,
    },
    {
      label: "Amazon",
      href: `https://www.amazon.com/s?k=${partQ}+${encodeURIComponent(modelNumber || "appliance")}&i=garden`,
    },
  ];
}

export function PartLookupPanel({ applianceType }: PartLookupPanelProps) {
  const [modelNumber, setModelNumber] = useState("");
  const [symptom, setSymptom] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!modelNumber.trim() && !symptom.trim()) return;

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/parts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelNumber, symptom, applianceType }),
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

  const parts = extractParts(response);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search form */}
      <div className="border-b border-steel-border bg-dark-carbon px-6 py-5 shrink-0">
        <h2 className="text-base font-semibold text-warm-gold mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
          Part Lookup{applianceType ? ` — ${applianceType}` : ""}
        </h2>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 sm:items-end">
          <div className="flex gap-2 items-end">
            <div className="space-y-1.5 w-36 shrink-0">
              <Label className="text-xs text-warm-gold/60">Model Number</Label>
              <Input
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
                placeholder="e.g. WDT780SAEM1"
                className="bg-dark-chrome border-steel-border text-warm-gold placeholder:text-warm-gold/25 h-11 text-sm focus-visible:ring-forge-amber"
              />
            </div>
            <div className="space-y-1.5 flex-1">
              <Label className="text-xs text-warm-gold/60">Symptom or Part</Label>
              <Input
                value={symptom}
                onChange={(e) => setSymptom(e.target.value)}
                placeholder="e.g. door latch broken"
                className="bg-dark-chrome border-steel-border text-warm-gold placeholder:text-warm-gold/25 h-11 text-sm focus-visible:ring-forge-amber"
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading || (!modelNumber.trim() && !symptom.trim())}
            className="bg-forge-amber text-ink font-semibold hover:bg-forge-amber/90 h-11 w-full sm:w-auto shrink-0 gap-1.5 disabled:opacity-40"
          >
            <Search size={14} />
            {loading ? "Searching…" : "Search"}
          </Button>
        </form>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {!response && !loading && (
          <div className="flex items-center justify-center h-full text-center px-6">
            <div className="space-y-4">
              <div className="flex justify-center">
                <svg width="192" height="192" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-25">
                  {/* Gear body */}
                  <path d="M32 20a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm0 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12z" fill="#EF9F27"/>
                  {/* Gear teeth */}
                  <path d="M27.5 8h9l1.5 5.5a14.9 14.9 0 0 1 4.7 2.7l5.6-1.7 4.5 7.8-4.2 3.8c.1.6.2 1.2.2 1.9s-.1 1.3-.2 1.9l4.2 3.8-4.5 7.8-5.6-1.7a14.9 14.9 0 0 1-4.7 2.7L36.5 56h-9l-1.5-5.5a14.9 14.9 0 0 1-4.7-2.7l-5.6 1.7-4.5-7.8 4.2-3.8c-.1-.6-.2-1.2-.2-1.9s.1-1.3.2-1.9l-4.2-3.8 4.5-7.8 5.6 1.7a14.9 14.9 0 0 1 4.7-2.7L27.5 8z" stroke="#EF9F27" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <div className="space-y-2">
                <p className="text-warm-gold/50 text-2xl font-medium">Enter a model number or describe the issue</p>
                <p className="text-warm-gold/30 text-base">Claude identifies the likely parts — search links go straight to real parts databases</p>
              </div>
            </div>
          </div>
        )}

        {(response || loading) && (
          <div className="px-6 py-5 space-y-5">
            {/* Identified parts chips */}
            {parts.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-warm-gold/40 font-semibold uppercase tracking-wider">Likely Faulty Parts</p>
                <div className="flex flex-col gap-2">
                  {parts.map((p, i) => (
                    <div key={i} className="flex flex-col gap-2 bg-dark-chrome rounded-xl border border-steel-border px-4 py-3">
                      <div className="min-w-0">
                        <span className="text-sm text-forge-amber font-semibold">{p.name}</span>
                        {p.description && (
                          <p className="text-xs text-warm-gold/60 leading-relaxed mt-0.5">{p.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {partLinks(p.name, modelNumber).map((link) => (
                          <a
                            key={link.label}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-forge-amber/70 hover:text-forge-amber border border-forge-amber/25 hover:border-forge-amber/60 rounded-md px-3 py-1.5 flex items-center gap-1 transition-colors whitespace-nowrap"
                          >
                            {link.label}
                            <ExternalLink size={10} />
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Full response */}
            <div className="space-y-1">
              {parts.length > 0 && <p className="text-xs text-warm-gold/40 font-semibold uppercase tracking-wider">Full Response</p>}
              <p className="text-sm text-warm-gold/80 whitespace-pre-wrap leading-relaxed">
                {response}
                {loading && <span className="inline-block w-1.5 h-3.5 bg-forge-amber ml-0.5 animate-pulse align-middle" />}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

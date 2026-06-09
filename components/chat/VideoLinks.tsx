"use client";

import { useEffect, useState } from "react";
import { Play, X } from "lucide-react";

interface VideoResult {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration: string;
}

interface VideoLinksProps {
  query: string;   // appliance + fault context
  enabled: boolean; // only fetch when the message contains repair steps
}

export function VideoLinks({ query, enabled }: VideoLinksProps) {
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [active, setActive] = useState<VideoResult | null>(null);

  useEffect(() => {
    if (!enabled || !query.trim()) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/videos?q=${encodeURIComponent(query)}`);
        if (!res.ok) return; // silent fail
        const data = await res.json();
        if (!cancelled && Array.isArray(data.videos)) setVideos(data.videos.slice(0, 2));
      } catch {
        // silent fail — never surface an error to the user
      }
    })();
    return () => { cancelled = true; };
  }, [query, enabled]);

  if (videos.length === 0) return null;

  return (
    <>
      <div className="mt-3 space-y-2">
        <p className="text-[10px] uppercase tracking-wider text-warm-gold/30 font-semibold">Helpful repair videos</p>
        <div className="flex flex-col gap-2">
          {videos.map((v) => (
            <button
              key={v.id}
              onClick={() => setActive(v)}
              className="flex items-center gap-3 bg-dark-chrome border border-steel-border hover:border-forge-amber/50 rounded-lg p-2 text-left transition-colors group"
            >
              <div className="relative shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.thumbnail} alt="" className="w-24 h-14 object-cover rounded-md" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-7 h-7 rounded-full bg-black/60 flex items-center justify-center group-hover:bg-forge-amber/90 transition-colors">
                    <Play size={13} className="text-white ml-0.5" fill="currentColor" />
                  </div>
                </div>
                {v.duration && (
                  <span className="absolute bottom-1 right-1 text-[9px] bg-black/80 text-white px-1 rounded">{v.duration}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-warm-gold line-clamp-2 leading-snug">{v.title}</p>
                <p className="text-[10px] text-warm-gold/40 mt-1">{v.channel}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setActive(null); }}
        >
          <div className="w-full max-w-2xl">
            <div className="flex justify-end mb-2">
              <button onClick={() => setActive(null)} className="text-white/70 hover:text-white">
                <X size={22} />
              </button>
            </div>
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <iframe
                className="absolute inset-0 w-full h-full rounded-xl"
                src={`https://www.youtube.com/embed/${active.id}?autoplay=1`}
                title={active.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { cn } from "@/lib/utils";

type Variant = "dark" | "light" | "ghost";

interface DyagnoLogoProps {
  size?: number;
  variant?: Variant;
  className?: string;
  showWordmark?: boolean;
}

const VARIANTS = {
  dark: {
    bg: "#2a2318",
    hexStroke: "#EF9F27",
    pulseStroke: "#FAC775",
    dot: "#EF9F27",
    wordmarkD: "#EF9F27",
    wordmarkRest: "#FAC775",
  },
  light: {
    bg: "#854F0B",
    hexStroke: "#FAEEDA",
    pulseStroke: "#FAC775",
    dot: "#FAC775",
    wordmarkD: "#854F0B",
    wordmarkRest: "#633806",
  },
  ghost: {
    bg: "none",
    hexStroke: "#EF9F27",
    pulseStroke: "#854F0B",
    dot: "#EF9F27",
    wordmarkD: "#EF9F27",
    wordmarkRest: "#1c1a14",
  },
};

export function DyagnoLogo({
  size = 40,
  variant = "dark",
  className,
  showWordmark = false,
}: DyagnoLogoProps) {
  const v = VARIANTS[variant];
  const r = 6; // corner radius for flat-top hexagon

  // Flat-top hexagon points (rotated 90° from pointy-top)
  // For a flat-top hex inscribed in a circle of radius R centered at (cx, cy):
  // The six vertices at angles 0°, 60°, 120°, 180°, 240°, 300°
  const cx = 24;
  const cy = 24;
  const R = 18;
  const angles = [0, 60, 120, 180, 240, 300].map((a) => (a * Math.PI) / 180);
  const pts = angles.map((a) => ({
    x: cx + R * Math.cos(a),
    y: cy + R * Math.sin(a),
  }));
  const hexPath = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ") + " Z";

  // ECG pulse path across the middle of the hexagon
  // Starts left, flat, spike up, spike down, flat, end
  const pulse = `M 9,24 L 15,24 L 17,18 L 20,30 L 23,22 L 26,24 L 39,24`;
  // Amber dot at the fault point
  const dotX = 23;
  const dotY = 22;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Dyagno logo mark"
      >
        {/* Background */}
        {v.bg !== "none" && (
          <rect width="48" height="48" rx={r} fill={v.bg} />
        )}
        {/* Hexagon */}
        <path
          d={hexPath}
          stroke={v.hexStroke}
          strokeWidth="2"
          fill="none"
          strokeLinejoin="round"
        />
        {/* ECG pulse line */}
        <path
          d={pulse}
          stroke={v.pulseStroke}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Fault dot */}
        <circle cx={dotX} cy={dotY} r="1.5" fill={v.dot} />
      </svg>

      {showWordmark && (
        <span
          className="text-2xl font-bold tracking-tight leading-none select-none"
          style={{ fontFamily: "var(--font-space-grotesk)", letterSpacing: "-0.03em" }}
        >
          <span style={{ color: v.wordmarkD }}>D</span>
          <span style={{ color: v.wordmarkRest }}>yagno</span>
        </span>
      )}
    </div>
  );
}

import { cn } from "@/lib/utils";

interface PulseRingProps {
  className?: string;
}

export function PulseRing({ className }: PulseRingProps) {
  return <div className={cn("dyagno-pulse-ring", className)} />;
}

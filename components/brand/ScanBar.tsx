import { cn } from "@/lib/utils";

interface ScanBarProps {
  className?: string;
}

export function ScanBar({ className }: ScanBarProps) {
  return <div className={cn("dyagno-scan-bar w-full", className)} />;
}

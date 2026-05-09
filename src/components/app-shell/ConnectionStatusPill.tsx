"use client";

import { cn } from "@/lib/utils";
import { useConnectionStore } from "@/lib/store/connection-store";

const STATUS_CONFIG = {
  disconnected: { dot: "bg-gray-400",   bg: "bg-gray-100",   border: "border-gray-200",   text: "text-gray-500",   label: "Nije povezan" },
  connecting:   { dot: "bg-amber-400",  bg: "bg-amber-50",   border: "border-amber-200",  text: "text-amber-700",  label: "Povezivanje..." },
  connected:    { dot: "bg-green-500",  bg: "bg-green-50",   border: "border-green-200",  text: "text-green-700",  label: "Povezan" },
  error:        { dot: "bg-red-500",    bg: "bg-red-50",     border: "border-red-200",    text: "text-red-700",    label: "Greška" },
} as const;

export function ConnectionStatusPill() {
  const status = useConnectionStore((s) => s.status);
  const { dot, bg, border, text, label } = STATUS_CONFIG[status];

  return (
    <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full border", bg, border)}>
      <span className={cn("w-2 h-2 rounded-full flex-shrink-0", dot)} aria-hidden="true" />
      <span className={cn("text-xs font-medium whitespace-nowrap", text)}>
        {label}
      </span>
    </div>
  );
}

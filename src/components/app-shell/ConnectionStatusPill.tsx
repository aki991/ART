"use client";

import { cn } from "@/lib/utils";
import { useConnectionStore } from "@/lib/store/connection-store";

const STATUS_CONFIG = {
  disconnected: { dot: "bg-text-disabled",  bg: "bg-bg-hover",          border: "border-border",                text: "text-text-tertiary",  label: "Nije povezan" },
  connecting:   { dot: "bg-status-warning", bg: "bg-bg-warning-light",  border: "border-status-warning/40",     text: "text-status-warning", label: "Povezivanje..." },
  connected:    { dot: "bg-status-success", bg: "bg-bg-success-light",  border: "border-status-success/40",     text: "text-status-success", label: "Povezan" },
  error:        { dot: "bg-status-error",   bg: "bg-bg-error-light",    border: "border-status-error/40",       text: "text-status-error",   label: "Greška" },
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

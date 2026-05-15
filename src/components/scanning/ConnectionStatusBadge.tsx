"use client";

import { Circle, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useConnectionStore } from "@/lib/store/connection-store";

export function ConnectionStatusBadge() {
  const { status, deviceInfo, errorMessage } = useConnectionStore();

  const config = {
    disconnected: {
      classes: "bg-bg-hover text-text-tertiary border-border",
      icon: <Circle size={14} className="fill-text-tertiary text-text-tertiary" aria-hidden="true" />,
      text: "Nije povezano",
    },
    connecting: {
      classes: "bg-bg-warning-light text-status-warning border-status-warning/40",
      icon: <Loader2 size={14} className="animate-spin" aria-hidden="true" />,
      text: "Povezivanje...",
    },
    connected: {
      classes: "bg-bg-success-light text-status-success border-status-success/40",
      icon: <CheckCircle2 size={14} aria-hidden="true" />,
      text: deviceInfo ? `Povezano (${deviceInfo.deviceId})` : "Povezano",
    },
    error: {
      classes: "bg-bg-error-light text-status-error border-status-error/40",
      icon: <AlertCircle size={14} aria-hidden="true" />,
      text: `Greška: ${errorMessage ?? "nepoznata"}`,
    },
  }[status];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium",
        config.classes
      )}
    >
      {config.icon}
      {config.text}
    </div>
  );
}

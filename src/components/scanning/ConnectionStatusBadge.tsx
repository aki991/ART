"use client";

import { Circle, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useConnectionStore } from "@/lib/store/connection-store";

export function ConnectionStatusBadge() {
  const { status, deviceInfo, errorMessage } = useConnectionStore();

  const config = {
    disconnected: {
      classes: "bg-gray-100 text-gray-700 border-gray-200",
      icon: <Circle size={14} className="fill-gray-400 text-gray-400" aria-hidden="true" />,
      text: "Nije povezano",
    },
    connecting: {
      classes: "bg-amber-50 text-amber-700 border-amber-200",
      icon: <Loader2 size={14} className="animate-spin" aria-hidden="true" />,
      text: "Povezivanje...",
    },
    connected: {
      classes: "bg-green-50 text-green-700 border-green-200",
      icon: <CheckCircle2 size={14} aria-hidden="true" />,
      text: deviceInfo ? `Povezano (${deviceInfo.deviceId})` : "Povezano",
    },
    error: {
      classes: "bg-red-50 text-red-700 border-red-200",
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

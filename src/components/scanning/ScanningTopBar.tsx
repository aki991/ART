"use client";

import { Signal, Battery } from "lucide-react";
import { useConnectionStore } from "@/lib/store/connection-store";

// Signal value je hardkodirana za sada — bazna stanica još ne izlaže RSSI.
const SIGNAL_STRENGTH_PCT = 85;

export function ScanningTopBar() {
  const status = useConnectionStore((s) => s.status);
  const deviceInfo = useConnectionStore((s) => s.deviceInfo);

  // Prikaži samo kad je device povezan.
  if (status !== "connected" || !deviceInfo) return null;

  const batteryColor =
    deviceInfo.batteryPct >= 50
      ? "text-status-success"
      : deviceInfo.batteryPct >= 20
        ? "text-status-warning"
        : "text-status-error";

  return (
    <div className="flex items-center justify-end gap-3 xl:gap-4 2xl:gap-6 px-4 xl:px-5 2xl:px-6 py-2 xl:py-2.5 2xl:py-3 bg-bg-surface border-b border-border">
      <div className="flex items-center gap-1.5 xl:gap-2 2xl:gap-2">
        <Signal className="w-4 h-4 xl:w-4 xl:h-4 2xl:w-5 2xl:h-5 text-accent flex-shrink-0" aria-hidden="true" />
        <span className="text-xs xl:text-xs 2xl:text-sm uppercase tracking-wide text-text-tertiary font-medium">
          Signal
        </span>
        <span className="text-sm xl:text-sm 2xl:text-base font-bold font-rajdhani text-text-primary tabular-nums">
          {SIGNAL_STRENGTH_PCT}%
        </span>
      </div>

      <div className="h-4 w-px bg-border-strong" aria-hidden="true" />

      <div className="flex items-center gap-1.5 xl:gap-2 2xl:gap-2">
        <Battery className={`w-4 h-4 xl:w-4 xl:h-4 2xl:w-5 2xl:h-5 flex-shrink-0 ${batteryColor}`} aria-hidden="true" />
        <span className="text-xs xl:text-xs 2xl:text-sm uppercase tracking-wide text-text-tertiary font-medium">
          Baterija
        </span>
        <span className="text-sm xl:text-sm 2xl:text-base font-bold font-rajdhani text-text-primary tabular-nums">
          {deviceInfo.batteryPct}%
        </span>
      </div>
    </div>
  );
}

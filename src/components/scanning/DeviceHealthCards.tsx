"use client";

import { Signal, Battery } from "lucide-react";

const SIGNAL_STRENGTH = 85;
const BATTERY_LEVEL = 67;

export function DeviceHealthCards() {
  return (
    <div className="flex items-center gap-4 px-1">
      <div className="flex items-center gap-2">
        <Signal className="w-4 h-4 text-accent flex-shrink-0" aria-hidden="true" />
        <span className="text-xs uppercase tracking-wide text-text-tertiary font-medium">Signal</span>
        <span className="text-base font-bold font-rajdhani text-text-primary">{SIGNAL_STRENGTH}%</span>
      </div>

      <div className="w-px h-4 bg-border-strong flex-shrink-0" aria-hidden="true" />

      <div className="flex items-center gap-2">
        <Battery className="w-4 h-4 text-status-success flex-shrink-0" aria-hidden="true" />
        <span className="text-xs uppercase tracking-wide text-text-tertiary font-medium">Baterija</span>
        <span className="text-base font-bold font-rajdhani text-text-primary">{BATTERY_LEVEL}%</span>
      </div>
    </div>
  );
}

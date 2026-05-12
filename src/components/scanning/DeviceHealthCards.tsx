"use client";

import { Signal, Battery } from "lucide-react";

const SIGNAL_STRENGTH = 85;
const BATTERY_LEVEL = 67;

export function DeviceHealthCards() {
  return (
    <div className="flex items-center gap-4 px-1">
      <div className="flex items-center gap-2">
        <Signal className="w-4 h-4 text-cyan-brand flex-shrink-0" aria-hidden="true" />
        <span className="text-xs uppercase tracking-wide text-white/50 font-medium">Signal</span>
        <span className="text-base font-bold font-rajdhani text-white">{SIGNAL_STRENGTH}%</span>
      </div>

      <div className="w-px h-4 bg-white/20 flex-shrink-0" aria-hidden="true" />

      <div className="flex items-center gap-2">
        <Battery className="w-4 h-4 text-green-400 flex-shrink-0" aria-hidden="true" />
        <span className="text-xs uppercase tracking-wide text-white/50 font-medium">Baterija</span>
        <span className="text-base font-bold font-rajdhani text-white">{BATTERY_LEVEL}%</span>
      </div>
    </div>
  );
}

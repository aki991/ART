"use client";

import { useTelemetryStore } from "@/lib/store/telemetry-store";

export function MaxAltitudeCard() {
  const sessionMaxAltitude = useTelemetryStore((s) => s.sessionMaxAltitude);
  const display = sessionMaxAltitude > 0 ? sessionMaxAltitude.toFixed(1) : "—";

  return (
    <div className="card-redesign p-6 text-center">
      <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
        Najviša visina
      </p>
      <p className="text-5xl font-bold font-rajdhani text-gradient-cyan leading-none">
        {display}
      </p>
      <p className="text-xs uppercase tracking-wider text-gray-400 mt-1">Metri</p>
    </div>
  );
}

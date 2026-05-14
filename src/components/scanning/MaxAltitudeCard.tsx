"use client";

import { useTelemetryStore } from "@/lib/store/telemetry-store";

export function MaxAltitudeCard() {
  const sessionMaxAltitude = useTelemetryStore((s) => s.sessionMaxAltitude);
  const display = sessionMaxAltitude > 0 ? String(Math.round(sessionMaxAltitude)) : "—";

  return (
    <div className="card-redesign p-6 text-center">
      <p className="text-sm uppercase tracking-widest text-white/60 mb-2">
        Najviša visina
      </p>
      <p className="text-5xl font-bold font-mono text-gradient-cyan leading-none">
        {display}
      </p>
      <p className="text-base uppercase tracking-wider text-white/40 mt-1">Metri</p>
    </div>
  );
}

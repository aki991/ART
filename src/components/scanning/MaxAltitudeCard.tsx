"use client";

import { useMemo } from "react";
import { useLiveRaceStore } from "@/lib/store/live-race-store";

export function MaxAltitudeCard() {
  const readings = useLiveRaceStore((s) => s.readings);

  const max = useMemo(() => {
    let m = 0;
    for (const r of readings) if (r.altitude > m) m = r.altitude;
    return m;
  }, [readings]);

  const display = max > 0 ? String(Math.round(max)) : "—";

  return (
    <div className="card-redesign p-6 text-center">
      <p className="text-sm uppercase tracking-widest text-text-tertiary mb-2">
        Najviša visina
      </p>
      <p className="text-5xl font-bold font-mono text-gradient-cyan leading-none">
        {display}
      </p>
      <p className="text-base uppercase tracking-wider text-text-disabled mt-1">Metri</p>
    </div>
  );
}

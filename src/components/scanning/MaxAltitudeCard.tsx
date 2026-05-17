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
    <div className="card-redesign p-3 xl:p-4 2xl:p-6 text-center min-w-0">
      <p className="text-[10px] xl:text-xs 2xl:text-sm uppercase tracking-widest text-text-tertiary mb-1 xl:mb-1.5 2xl:mb-2 whitespace-nowrap">
        Najviša visina
      </p>
      <p className="text-3xl xl:text-4xl 2xl:text-5xl font-bold text-gradient-cyan leading-none whitespace-nowrap">
        {display}
      </p>
      <p className="text-xs xl:text-sm 2xl:text-base uppercase tracking-wider text-text-disabled mt-1">Metri</p>
    </div>
  );
}

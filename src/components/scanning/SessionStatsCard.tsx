"use client";

import { useEffect, useMemo, useState } from "react";
import { useConnectionStore } from "@/lib/store/connection-store";
import { useLiveRaceStore } from "@/lib/store/live-race-store";

export function SessionStatsCard() {
  const raceStartedAtMs = useConnectionStore((s) => s.raceStartedAtMs);
  const readings = useLiveRaceStore((s) => s.readings);
  const [elapsed, setElapsed] = useState(() =>
    formatElapsed(raceStartedAtMs ? Date.now() - raceStartedAtMs : 0)
  );

  useEffect(() => {
    if (!raceStartedAtMs) {
      setElapsed("00:00");
      return;
    }
    function tick() {
      setElapsed(formatElapsed(Date.now() - raceStartedAtMs!));
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [raceStartedAtMs]);

  const { max, min } = useMemo(() => {
    let mx = 0;
    let mn = Infinity;
    for (const r of readings) {
      if (r.altitude > mx) mx = r.altitude;
      if (r.altitude < mn) mn = r.altitude;
    }
    return { max: mx, min: mn };
  }, [readings]);

  const maxDisplay = max > 0 ? `${Math.round(max)} m` : "—";
  const minDisplay = min === Infinity ? "—" : `${Math.round(min)} m`;

  return (
    <div className="card-redesign p-3 xl:p-4 2xl:p-6 min-w-0">
      <p className="text-[10px] xl:text-xs 2xl:text-sm uppercase tracking-widest text-text-tertiary mb-2 xl:mb-3 2xl:mb-4 whitespace-nowrap">
        Statistike
      </p>

      <div className="mb-2 xl:mb-3 2xl:mb-4 min-w-0">
        <p className="text-[10px] xl:text-[11px] 2xl:text-xs uppercase tracking-wide text-text-disabled mb-1 whitespace-nowrap">
          Trajanje sesije
        </p>
        <p className="text-lg xl:text-xl 2xl:text-2xl font-semibold text-accent whitespace-nowrap">{elapsed}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 xl:gap-2.5 2xl:gap-3">
        <div className="bg-bg-hover rounded p-2 xl:p-2.5 2xl:p-3 min-w-0">
          <p className="text-[10px] xl:text-xs 2xl:text-sm uppercase text-text-tertiary mb-1 truncate">Maksimum</p>
          <p className="text-base xl:text-lg 2xl:text-2xl font-semibold text-status-error whitespace-nowrap">
            {maxDisplay}
          </p>
        </div>
        <div className="bg-bg-hover rounded p-2 xl:p-2.5 2xl:p-3 min-w-0">
          <p className="text-[10px] xl:text-xs 2xl:text-sm uppercase text-text-tertiary mb-1 truncate">Minimum</p>
          <p className="text-base xl:text-lg 2xl:text-2xl font-semibold text-status-success whitespace-nowrap">
            {minDisplay}
          </p>
        </div>
      </div>
    </div>
  );
}

function formatElapsed(diffMs: number): string {
  const diff = Math.max(0, Math.floor(diffMs / 1000));
  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;
  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

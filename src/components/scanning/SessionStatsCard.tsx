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
    <div className="card-redesign p-6">
      <p className="text-sm uppercase tracking-widest text-text-tertiary mb-4">
        Statistike (sesija)
      </p>

      <div className="mb-4">
        <p className="text-xs uppercase tracking-wide text-text-disabled mb-1">
          Trajanje sesije
        </p>
        <p className="text-2xl font-semibold font-mono text-accent">{elapsed}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-bg-hover rounded p-3">
          <p className="text-sm uppercase text-text-tertiary mb-1">Maksimum</p>
          <p className="text-2xl font-semibold font-mono text-status-error">
            {maxDisplay}
          </p>
        </div>
        <div className="bg-bg-hover rounded p-3">
          <p className="text-sm uppercase text-text-tertiary mb-1">Minimum</p>
          <p className="text-2xl font-semibold font-mono text-status-success">
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

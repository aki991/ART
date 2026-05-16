"use client";

import { useMemo } from "react";
import { useConnectionStore } from "@/lib/store/connection-store";
import { useLiveRaceStore } from "@/lib/store/live-race-store";

export function PigeonLegend() {
  const activeRacePigeons = useConnectionStore((s) => s.activeRacePigeons);
  const readings = useLiveRaceStore((s) => s.readings);

  // Latest altitude per pigeon (by pigeon_id, picking max elapsed_seconds).
  const latestByPigeonId = useMemo(() => {
    const map = new Map<string, number>();
    const maxSeenAt = new Map<string, number>();
    for (const r of readings) {
      const seen = maxSeenAt.get(r.pigeon_id) ?? -1;
      if (r.elapsed_seconds > seen) {
        maxSeenAt.set(r.pigeon_id, r.elapsed_seconds);
        map.set(r.pigeon_id, r.altitude);
      }
    }
    return map;
  }, [readings]);

  return (
    <div className="card-redesign p-3 xl:p-6">
      <p className="text-[10px] xl:text-sm uppercase tracking-widest text-text-tertiary mb-2 xl:mb-3">
        Golubovi
      </p>
      <ul className="space-y-2 xl:space-y-3">
        {activeRacePigeons.map((pigeon) => {
          const last = latestByPigeonId.get(pigeon.pigeonId);
          const altDisplay =
            typeof last === "number" ? `${Math.round(last)} m` : "—";

          return (
            <li key={pigeon.id} className="flex items-center gap-3 min-w-0">
              <span
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: pigeon.color }}
                aria-hidden="true"
              />
              <span className="text-sm xl:text-base font-medium font-mono text-text-primary flex-1 whitespace-nowrap truncate min-w-0">
                {pigeon.name}
              </span>
              <span className="text-sm xl:text-base font-medium font-mono text-text-tertiary whitespace-nowrap flex-shrink-0">
                {altDisplay}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

"use client";

import { useTelemetryStore } from "@/lib/store/telemetry-store";
import { useConnectionStore } from "@/lib/store/connection-store";

export function PigeonLegend() {
  const readings = useTelemetryStore((s) => s.readings);
  const activeRacePigeons = useConnectionStore((s) => s.activeRacePigeons);

  return (
    <div className="card-redesign p-6">
      <p className="text-sm uppercase tracking-widest text-text-tertiary mb-3">
        Golubovi
      </p>
      <ul className="space-y-3">
        {activeRacePigeons.map((pigeon) => {
          const arr = readings.get(pigeon.id) ?? [];
          const last = arr[arr.length - 1];
          const altDisplay = last
            ? `${last.altitudeMeters.toFixed(0)} m`
            : "—";

          return (
            <li key={pigeon.id} className="flex items-center gap-3">
              <span
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: pigeon.color }}
                aria-hidden="true"
              />
              <span className="text-base font-medium text-text-primary flex-1">
                {pigeon.name}
              </span>
              <span className="text-base font-medium font-mono text-text-tertiary">
                {altDisplay}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

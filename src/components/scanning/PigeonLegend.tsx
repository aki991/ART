"use client";

import { useTelemetryStore } from "@/lib/store/telemetry-store";

export function PigeonLegend() {
  const readings = useTelemetryStore((s) => s.readings);
  const profiles = useTelemetryStore((s) => s.profiles);

  return (
    <div className="card-redesign p-4">
      <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">
        Golubovi
      </p>
      <ul className="space-y-2">
        {profiles.map((profile) => {
          const arr = readings.get(profile.ringId) ?? [];
          const last = arr[arr.length - 1];
          const altDisplay = last
            ? `${last.altitudeMeters.toFixed(0)} m`
            : "—";

          return (
            <li key={profile.ringId} className="flex items-center gap-3">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: profile.color }}
                aria-hidden="true"
              />
              <span className="text-sm font-medium text-gray-900 flex-1">
                {profile.pigeonName}
              </span>
              <span className="text-sm font-mono text-gray-600">
                {altDisplay}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

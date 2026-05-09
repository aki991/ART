"use client";

import { useTelemetryStore } from "@/lib/store/telemetry-store";

export function SessionStatsCard() {
  const sessionMaxAltitude = useTelemetryStore((s) => s.sessionMaxAltitude);
  const sessionMinAltitude = useTelemetryStore((s) => s.sessionMinAltitude);

  const maxDisplay =
    sessionMaxAltitude > 0 ? `${Math.round(sessionMaxAltitude)} m` : "—";
  const minDisplay =
    sessionMinAltitude === Infinity ? "—" : `${Math.round(sessionMinAltitude)} m`;

  return (
    <div className="card-redesign p-4">
      <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">
        Statistike (sesija)
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded p-3">
          <p className="text-xs uppercase text-gray-500 mb-1">Maksimum</p>
          <p className="text-lg font-semibold font-rajdhani text-red-600">
            {maxDisplay}
          </p>
        </div>
        <div className="bg-gray-50 rounded p-3">
          <p className="text-xs uppercase text-gray-500 mb-1">Minimum</p>
          <p className="text-lg font-semibold font-rajdhani text-green-600">
            {minDisplay}
          </p>
        </div>
      </div>
    </div>
  );
}

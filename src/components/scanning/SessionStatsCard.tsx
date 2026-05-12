"use client";

import { useState, useEffect } from "react";
import { useTelemetryStore } from "@/lib/store/telemetry-store";

export function SessionStatsCard() {
  const sessionMaxAltitude = useTelemetryStore((s) => s.sessionMaxAltitude);
  const sessionMinAltitude = useTelemetryStore((s) => s.sessionMinAltitude);
  const recordingStartedAt = useTelemetryStore((s) => s.recordingStartedAt);
  const [elapsed, setElapsed] = useState("00:00");

  useEffect(() => {
    if (!recordingStartedAt) {
      setElapsed("00:00");
      return;
    }

    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - recordingStartedAt) / 1000);
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      if (hours > 0) {
        setElapsed(
          `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
        );
      } else {
        setElapsed(
          `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [recordingStartedAt]);

  const maxDisplay =
    sessionMaxAltitude > 0 ? `${Math.round(sessionMaxAltitude)} m` : "—";
  const minDisplay =
    sessionMinAltitude === Infinity ? "—" : `${Math.round(sessionMinAltitude)} m`;

  return (
    <div className="card-redesign p-6">
      <p className="text-sm uppercase tracking-widest text-gray-500 mb-4">
        Statistike (sesija)
      </p>

      <div className="mb-4">
        <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
          Trajanje sesije
        </p>
        <p className="text-2xl font-semibold font-rajdhani text-cyan-brand">
          {elapsed}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded p-3">
          <p className="text-sm uppercase text-gray-500 mb-1">Maksimum</p>
          <p className="text-2xl font-semibold font-rajdhani text-red-600">
            {maxDisplay}
          </p>
        </div>
        <div className="bg-gray-50 rounded p-3">
          <p className="text-sm uppercase text-gray-500 mb-1">Minimum</p>
          <p className="text-2xl font-semibold font-rajdhani text-green-600">
            {minDisplay}
          </p>
        </div>
      </div>
    </div>
  );
}

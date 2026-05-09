"use client";

import { useEffect } from "react";
import { simulatedTelemetrySource } from "@/lib/telemetry/simulated-source";
import { useTelemetryStore } from "@/lib/store/telemetry-store";
import { AltitudeChart } from "./AltitudeChart";
import { MaxAltitudeCard } from "./MaxAltitudeCard";
import { SessionStatsCard } from "./SessionStatsCard";
import { PigeonLegend } from "./PigeonLegend";
import { SimulationControls } from "./SimulationControls";

export function LiveFlightDashboard() {
  const addReading = useTelemetryStore((s) => s.addReading);
  const setProfiles = useTelemetryStore((s) => s.setProfiles);
  const startSession = useTelemetryStore((s) => s.startSession);

  useEffect(() => {
    setProfiles(simulatedTelemetrySource.getProfiles());
    startSession();

    const unsubscribe = simulatedTelemetrySource.onReading(addReading);
    simulatedTelemetrySource.start();

    return () => {
      unsubscribe();
      simulatedTelemetrySource.stop();
    };
  }, [addReading, setProfiles, startSession]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
      <aside className="space-y-4">
        <MaxAltitudeCard />
        <SessionStatsCard />
        <PigeonLegend />
        <SimulationControls />
      </aside>
      <main>
        <AltitudeChart />
      </main>
    </div>
  );
}

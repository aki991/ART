"use client";

import { AltitudeChart } from "./AltitudeChart";
import { MaxAltitudeCard } from "./MaxAltitudeCard";
import { SessionStatsCard } from "./SessionStatsCard";
import { PigeonLegend } from "./PigeonLegend";
import { SimulationControls } from "./SimulationControls";
import { useRaceReadingsSync } from "@/lib/hooks/useRaceReadingsSync";
import { useRaceSimulator } from "@/lib/hooks/useRaceSimulator";
import { useSerialTelemetry } from "@/lib/hooks/useSerialTelemetry";

export function LiveFlightDashboard() {
  // Every tab polls the DB for the canonical readings (single source of truth).
  useRaceReadingsSync();
  // Only the tab that started (or claimed) the race generates readings.
  useRaceSimulator();
  // Realni izvor (Web Serial) — aktivan samo kad je method === "usb-c".
  useSerialTelemetry();

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-10 lg:gap-4 xl:lg:gap-5 2xl:gap-6 2xl:h-full">
      <div className="order-1 lg:order-none lg:col-start-1 lg:col-span-3 lg:row-start-4 min-w-0">
        <SimulationControls />
      </div>

      <main className="order-2 lg:order-none lg:col-start-4 lg:col-span-7 lg:row-start-1 lg:row-span-4 2xl:h-full min-w-0 lg:min-h-[500px]">
        <AltitudeChart />
      </main>

      <div className="order-3 lg:order-none lg:col-start-1 lg:col-span-3 lg:row-start-1 min-w-0">
        <MaxAltitudeCard />
      </div>

      <div className="order-4 lg:order-none lg:col-start-1 lg:col-span-3 lg:row-start-2 min-w-0">
        <SessionStatsCard />
      </div>

      <div className="order-5 lg:order-none lg:col-start-1 lg:col-span-3 lg:row-start-3 min-w-0">
        <PigeonLegend />
      </div>
    </div>
  );
}

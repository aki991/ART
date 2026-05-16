"use client";

import { AltitudeChart } from "./AltitudeChart";
import { MaxAltitudeCard } from "./MaxAltitudeCard";
import { SessionStatsCard } from "./SessionStatsCard";
import { PigeonLegend } from "./PigeonLegend";
import { SimulationControls } from "./SimulationControls";
import { useRaceReadingsSync } from "@/lib/hooks/useRaceReadingsSync";
import { useRaceSimulator } from "@/lib/hooks/useRaceSimulator";

export function LiveFlightDashboard() {
  // Every tab polls the DB for the canonical readings (single source of truth).
  useRaceReadingsSync();
  // Only the tab that started (or claimed) the race generates readings.
  useRaceSimulator();

  return (
    <div className="grid grid-cols-10 gap-4 xl:gap-5 2xl:gap-6 2xl:h-full">
      <aside className="col-span-3 flex flex-col gap-3 xl:gap-3.5 2xl:gap-4 2xl:overflow-y-auto min-w-0">
        <MaxAltitudeCard />
        <SessionStatsCard />
        <PigeonLegend />
        <SimulationControls />
      </aside>
      <main className="col-span-7 2xl:h-full min-w-0 min-h-[500px]">
        <AltitudeChart />
      </main>
    </div>
  );
}

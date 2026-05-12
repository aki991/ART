"use client";

import { AltitudeChart } from "./AltitudeChart";
import { MaxAltitudeCard } from "./MaxAltitudeCard";
import { SessionStatsCard } from "./SessionStatsCard";
import { PigeonLegend } from "./PigeonLegend";
import { SimulationControls } from "./SimulationControls";

export function LiveFlightDashboard() {
  return (
    <div className="grid grid-cols-10 gap-6 h-full">
      <aside className="col-span-3 flex flex-col gap-4 overflow-y-auto">
        <MaxAltitudeCard />
        <SessionStatsCard />
        <PigeonLegend />
        <SimulationControls />
      </aside>
      <main className="col-span-7 h-full">
        <AltitudeChart />
      </main>
    </div>
  );
}

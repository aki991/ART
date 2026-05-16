"use client";

import { useMemo } from "react";
import { useConnectionStore } from "@/lib/store/connection-store";
import { useLiveRaceStore } from "@/lib/store/live-race-store";
import { computeYAxisConfig, buildXTicks } from "@/lib/utils/y-axis";
import { RaceAltitudeChart } from "@/components/shared/RaceAltitudeChart";

export function AltitudeChart() {
  const raceActive = useConnectionStore((s) => s.raceActive);
  const activeRacePigeons = useConnectionStore((s) => s.activeRacePigeons);
  const readings = useLiveRaceStore((s) => s.readings);

  const pigeonByPigeonId = useMemo(
    () => new Map(activeRacePigeons.map((p) => [p.pigeonId, p])),
    [activeRacePigeons]
  );

  const chartData = useMemo(() => {
    if (activeRacePigeons.length === 0 || readings.length === 0) return [];

    // Group readings by elapsed_seconds, build one chart row per time slot.
    const byElapsed = new Map<number, Record<string, number>>();
    for (const r of readings) {
      const pigeon = pigeonByPigeonId.get(r.pigeon_id);
      if (!pigeon) continue;
      let row = byElapsed.get(r.elapsed_seconds);
      if (!row) {
        row = { elapsedMinutes: parseFloat((r.elapsed_seconds / 60).toFixed(4)) };
        byElapsed.set(r.elapsed_seconds, row);
      }
      row[pigeon.id] = r.altitude;
    }
    return Array.from(byElapsed.values()).sort(
      (a, b) => (a.elapsedMinutes as number) - (b.elapsedMinutes as number)
    );
  }, [readings, activeRacePigeons, pigeonByPigeonId]);

  const yAxisConfig = useMemo(() => {
    let maxAlt = 0;
    for (const r of readings) {
      if (r.altitude > maxAlt) maxAlt = r.altitude;
    }
    return computeYAxisConfig(maxAlt);
  }, [readings]);

  const xMaxMinutes = useMemo(() => {
    if (chartData.length === 0) return 1;
    const maxElapsed = chartData[chartData.length - 1].elapsedMinutes as number;
    return Math.max(1, Math.ceil(maxElapsed));
  }, [chartData]);

  const xTicks = useMemo(() => buildXTicks(xMaxMinutes), [xMaxMinutes]);

  const hasData = chartData.length > 0;

  return (
    <div className="bg-bg-surface border border-accent/15 rounded-xl overflow-hidden p-4 xl:p-5 2xl:p-6 h-full min-h-[500px] flex flex-col">
      <div className="flex-shrink-0 mb-4 xl:mb-5 2xl:mb-6">
        <h2 className="text-2xl xl:text-2xl 2xl:text-3xl font-bold font-rajdhani text-text-primary">
          Visina kroz vreme
        </h2>
        <p className="text-base xl:text-base 2xl:text-lg text-text-tertiary">Real-time praćenje visine</p>
      </div>

      {!raceActive ? (
        <div className="flex-1 relative flex items-start justify-center pt-6">
          <div className="absolute inset-0 bg-[url('/Grafikon.png')] bg-no-repeat bg-[center_20%] bg-contain opacity-60" />
          <div className="relative z-10 bg-black/60 backdrop-blur-sm rounded-lg px-6 py-4 border border-border">
            <p className="text-text-primary text-base font-medium text-center">
              Pritisni{" "}
              <span className="text-accent font-bold">Start trke</span>{" "}
              da pokreneš simulaciju
            </p>
          </div>
        </div>
      ) : !hasData ? (
        <div
          className="flex-1 flex items-center justify-center"
          aria-label="Čekamo prve podatke sa bazne stanice"
        >
          <p className="text-text-disabled text-base font-rajdhani animate-pulse">
            Čekamo prve podatke...
          </p>
        </div>
      ) : (
        <div className="relative flex-1 min-h-[200px]">
          <RaceAltitudeChart
            chartData={chartData}
            pigeons={activeRacePigeons}
            xMaxMinutes={xMaxMinutes}
            xTicks={xTicks}
            yAxisConfig={yAxisConfig}
            height="100%"
          />
        </div>
      )}
    </div>
  );
}

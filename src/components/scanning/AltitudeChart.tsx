"use client";

import { useMemo } from "react";
import { useTelemetryStore } from "@/lib/store/telemetry-store";
import { useConnectionStore } from "@/lib/store/connection-store";
import { computeYAxisConfig, buildXTicks } from "@/lib/utils/y-axis";
import { RaceAltitudeChart } from "@/components/shared/RaceAltitudeChart";

export function AltitudeChart() {
  const readings = useTelemetryStore((s) => s.readings);
  const raceActive = useConnectionStore((s) => s.raceActive);
  const activeRacePigeons = useConnectionStore((s) => s.activeRacePigeons);

  const chartData = useMemo(() => {
    if (activeRacePigeons.length === 0) return [];
    const baseArr = readings.get(activeRacePigeons[0].id) ?? [];
    if (baseArr.length === 0) return [];

    const firstTs = baseArr[0].timestamp.getTime();

    return baseArr.map((baseReading, i) => {
      const elapsedMinutes = parseFloat(
        ((baseReading.timestamp.getTime() - firstTs) / 60000).toFixed(4)
      );
      const point: Record<string, number> = { elapsedMinutes };
      for (const pigeon of activeRacePigeons) {
        const arr = readings.get(pigeon.id) ?? [];
        const r = arr[i];
        if (r !== undefined) {
          point[pigeon.id] = parseFloat(r.altitudeMeters.toFixed(1));
        }
      }
      return point;
    });
  }, [readings, activeRacePigeons]);

  const yAxisConfig = useMemo(() => {
    let maxAlt = 0;
    for (const arr of readings.values()) {
      for (const r of arr) {
        if (r.altitudeMeters > maxAlt) maxAlt = r.altitudeMeters;
      }
    }
    return computeYAxisConfig(maxAlt);
  }, [readings]);

  const xMaxMinutes = useMemo(() => {
    if (chartData.length === 0) return 1;
    const maxElapsed = chartData[chartData.length - 1].elapsedMinutes;
    return Math.max(1, Math.ceil(maxElapsed));
  }, [chartData]);

  const xTicks = useMemo(() => buildXTicks(xMaxMinutes), [xMaxMinutes]);

  const hasData = chartData.length > 0;

  return (
    <div className="bg-card-dark border border-cyan-brand/15 rounded-xl overflow-hidden p-6 h-full flex flex-col">
      <div className="flex-shrink-0 mb-6">
        <h2 className="text-3xl font-bold font-rajdhani text-white">
          Visina kroz vreme
        </h2>
        <p className="text-lg text-white/70">Real-time praćenje visine</p>
      </div>

      {!raceActive ? (
        <div className="flex-1 relative flex items-start justify-center pt-6">
          <div className="absolute inset-0 bg-[url('/Grafikon.png')] bg-no-repeat bg-[center_20%] bg-contain opacity-60" />
          <div className="relative z-10 bg-black/60 backdrop-blur-sm rounded-lg px-6 py-4 border border-white/10">
            <p className="text-white text-base font-medium text-center">
              Pritisni{" "}
              <span className="text-cyan-brand font-bold">Start trke</span>{" "}
              da pokreneš simulaciju
            </p>
          </div>
        </div>
      ) : !hasData ? (
        <div
          className="flex-1 flex items-center justify-center"
          aria-label="Čekamo prve podatke sa bazne stanice"
        >
          <p className="text-white/40 text-base font-rajdhani animate-pulse">
            Čekamo prve podatke...
          </p>
        </div>
      ) : (
        <div className="relative flex-1 min-h-0">
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

"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trophy, User, Calendar, Clock, ArrowRight } from "lucide-react";
import { useRacesStore } from "@/lib/store/races-store";
import { computeYAxisConfig, buildXTicks } from "@/lib/utils/y-axis";
import { RaceAltitudeChart } from "@/components/shared/RaceAltitudeChart";

export function LastRaceChart() {
  const router = useRouter();
  const races = useRacesStore((s) => s.races);

  const lastRace = useMemo(
    () =>
      races.length === 0
        ? null
        : [...races].sort((a, b) => b.startedAt - a.startedAt)[0],
    [races]
  );

  const durationSeconds = lastRace
    ? Math.round((lastRace.endedAt - lastRace.startedAt) / 1000)
    : 0;

  const chartData = useMemo(() => {
    if (!lastRace) return [];
    return lastRace.readings.map((reading) => ({
      elapsedMinutes: (reading.timestamp - lastRace.startedAt) / 1000 / 60,
      ...reading.altitudes,
    }));
  }, [lastRace]);

  const maxAltitude = useMemo(() => {
    if (!lastRace) return 0;
    let max = 0;
    for (const reading of lastRace.readings) {
      for (const alt of Object.values(reading.altitudes)) {
        if (alt > max) max = alt;
      }
    }
    return max;
  }, [lastRace]);

  const yAxisConfig = useMemo(() => computeYAxisConfig(maxAltitude), [maxAltitude]);

  const xMaxMinutes = useMemo(() => {
    if (chartData.length === 0) return 1;
    return Math.max(1, Math.ceil(chartData[chartData.length - 1].elapsedMinutes));
  }, [chartData]);

  const xTicks = useMemo(() => buildXTicks(xMaxMinutes), [xMaxMinutes]);

  if (!lastRace) {
    return (
      <div className="card-redesign p-12 text-center">
        <Trophy className="w-16 h-16 text-white/20 mx-auto mb-4" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-white/80 mb-2">
          Još nema snimljenih trka
        </h3>
        <p className="text-white/60 mb-4">
          Pokreni prvu trku da vidiš grafik ovde.
        </p>
        <Link
          href="/scanning"
          className="inline-flex items-center gap-2 text-cyan-brand hover:text-cyan-dark font-medium transition-colors"
        >
          Pokreni prvu trku
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <div
      onClick={() => router.push(`/races/${lastRace.id}`)}
      className="card-redesign p-6 cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-cyan-brand" aria-hidden="true" />
            <span className="text-xs uppercase tracking-wide text-white/60 font-medium">
              Poslednja trka
            </span>
          </div>
          <div className="flex items-center gap-1 text-cyan-brand text-sm font-medium">
            Vidi detalje
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">{lastRace.name}</h2>
          <div className="flex items-center gap-5 text-base text-white/70">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-white/40" aria-hidden="true" />
              {lastRace.owner}
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-white/40" aria-hidden="true" />
              {formatDate(lastRace.startedAt)}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-white/40" aria-hidden="true" />
              {formatDuration(durationSeconds)}
            </div>
          </div>
        </div>
      </div>

      <RaceAltitudeChart
        chartData={chartData}
        pigeons={lastRace.pigeons}
        xMaxMinutes={xMaxMinutes}
        xTicks={xTicks}
        yAxisConfig={yAxisConfig}
        height={400}
      />
    </div>
  );
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}m ${s}s`;
}

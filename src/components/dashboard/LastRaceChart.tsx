"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trophy, User, Calendar, Clock, ArrowRight } from "lucide-react";
import { computeYAxisConfig, buildXTicks } from "@/lib/utils/y-axis";
import { RaceAltitudeChart } from "@/components/shared/RaceAltitudeChart";
import { PIGEON_COLOR_PALETTE } from "@/lib/utils/pigeon-palette";
import type { RaceWithDetails } from "@/lib/types/race";

interface LastRaceChartProps {
  race: RaceWithDetails | null;
}

export function LastRaceChart({ race }: LastRaceChartProps) {
  const router = useRouter();

  const pigeonsWithColor = useMemo(() => {
    if (!race) return [];
    return race.race_pigeons.map((rp, idx) => ({
      ...rp,
      // rp.color je server-side dodeljen pri startRace; fallback za
      // stare trke (pre migracije 007) gde je color = NULL.
      chartColor:
        rp.color ?? PIGEON_COLOR_PALETTE[idx % PIGEON_COLOR_PALETTE.length],
    }));
  }, [race]);

  const chartData = useMemo(() => {
    if (pigeonsWithColor.length === 0) return [];
    const elapsedSet = new Set<number>();
    for (const p of pigeonsWithColor) {
      for (const r of p.readings) elapsedSet.add(r.elapsed_seconds);
    }
    const elapsedSorted = Array.from(elapsedSet).sort((a, b) => a - b);

    return elapsedSorted.map((es) => {
      const point: Record<string, number> = {
        elapsedMinutes: parseFloat((es / 60).toFixed(4)),
      };
      for (const p of pigeonsWithColor) {
        const reading = p.readings.find((r) => r.elapsed_seconds === es);
        if (reading) point[p.id] = reading.altitude;
      }
      return point;
    });
  }, [pigeonsWithColor]);

  const xMaxMinutes = useMemo(() => {
    if (chartData.length === 0) return 1;
    return Math.max(1, Math.ceil(chartData[chartData.length - 1].elapsedMinutes));
  }, [chartData]);

  const xTicks = useMemo(() => buildXTicks(xMaxMinutes), [xMaxMinutes]);

  const yAxisConfig = useMemo(() => {
    if (!race) return computeYAxisConfig(800);
    let maxAlt = race.goal_altitude;
    for (const p of pigeonsWithColor) {
      if ((p.max_altitude ?? 0) > maxAlt) maxAlt = p.max_altitude ?? maxAlt;
    }
    return computeYAxisConfig(maxAlt);
  }, [pigeonsWithColor, race]);

  const chartPigeons = useMemo(
    () =>
      pigeonsWithColor.map((p) => ({
        id: p.id,
        name: p.pigeon_full_ring_number,
        color: p.chartColor,
      })),
    [pigeonsWithColor]
  );

  if (!race) {
    return (
      <div className="card-redesign p-12 text-center">
        <Trophy className="w-16 h-16 text-text-disabled mx-auto mb-4" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-text-secondary mb-2">
          Još nema snimljenih trka
        </h3>
        <p className="text-text-tertiary mb-4">
          Pokreni prvu trku da vidiš grafik ovde.
        </p>
        <Link
          href="/scanning"
          className="inline-flex items-center gap-2 text-accent hover:text-accent-hover font-medium transition-colors"
        >
          Pokreni prvu trku
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  const durationSeconds = race.duration_seconds ?? 0;
  const ownerName = race.owner_profile
    ? `${race.owner_profile.first_name} ${race.owner_profile.last_name}`.trim() ||
      race.owner_profile.username
    : "—";

  return (
    <div
      onClick={() => router.push(`/races/${race.id}`)}
      className="card-redesign p-3 lg:px-6 lg:pt-6 lg:pb-2 cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-accent" aria-hidden="true" />
            <span className="text-xs uppercase tracking-wide text-text-tertiary font-medium">
              Poslednja trka
            </span>
          </div>
          <div className="flex items-center gap-1 text-accent text-sm font-medium">
            Vidi detalje
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </div>
        </div>

        <div className="flex items-center justify-between max-lg:flex-col max-lg:items-start max-lg:gap-1.5">
          <h2 className="text-2xl font-bold text-text-primary max-lg:text-base max-lg:truncate">{race.name}</h2>
          <div className="flex items-center gap-5 text-base text-text-secondary max-lg:gap-2 max-lg:text-[11px] max-lg:shrink-0">
            <div className="flex items-center gap-1.5 max-lg:gap-1">
              <User className="w-4 h-4 text-text-tertiary max-lg:w-3 max-lg:h-3" aria-hidden="true" />
              {ownerName}
            </div>
            <div className="flex items-center gap-1.5 max-lg:gap-1">
              <Calendar className="w-4 h-4 text-text-tertiary max-lg:w-3 max-lg:h-3" aria-hidden="true" />
              {formatDate(race.started_at)}
            </div>
            <div className="flex items-center gap-1.5 max-lg:gap-1">
              <Clock className="w-4 h-4 text-text-tertiary max-lg:w-3 max-lg:h-3" aria-hidden="true" />
              {durationSeconds > 0 ? formatDuration(durationSeconds) : "—"}
            </div>
          </div>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="text-center py-12 text-text-tertiary">
          Nema snimljenih merenja za ovu trku.
        </div>
      ) : (
        <RaceAltitudeChart
          chartData={chartData}
          pigeons={chartPigeons}
          xMaxMinutes={xMaxMinutes}
          xTicks={xTicks}
          yAxisConfig={yAxisConfig}
          height={450}
        />
      )}
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("sr-RS", {
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

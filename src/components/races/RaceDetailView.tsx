"use client";

import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Calendar, Trophy, MapPin, Clock, Check, X, Lock, Users, Globe } from "lucide-react";
import { computeYAxisConfig, buildXTicks } from "@/lib/utils/y-axis";
import { RaceAltitudeChart } from "@/components/shared/RaceAltitudeChart";
import { PIGEON_COLOR_PALETTE } from "@/lib/utils/pigeon-palette";
import { PigeonHistoryModal } from "@/components/pigeons/PigeonHistoryModal";
import { getPigeonById } from "@/app/actions/pigeons";
import type { RaceWithDetails } from "@/lib/types/race";
import type { Pigeon } from "@/lib/types/pigeon";

interface RaceDetailViewProps {
  race: RaceWithDetails;
}

const VISIBILITY_META = {
  private: { Icon: Lock, label: "Privatno" },
  club: { Icon: Users, label: "Društvo" },
  public: { Icon: Globe, label: "Javno" },
} as const;

export function RaceDetailView({ race }: RaceDetailViewProps) {
  const [openPigeon, setOpenPigeon] = useState<Pigeon | null>(null);
  const [loadingPigeonId, setLoadingPigeonId] = useState<string | null>(null);

  const pigeonsWithColor = useMemo(
    () =>
      race.race_pigeons.map((rp, idx) => ({
        ...rp,
        // rp.color je server-side dodeljen pri startRace; fallback za
        // stare trke (pre migracije 007) gde je color = NULL.
        chartColor:
          rp.color ?? PIGEON_COLOR_PALETTE[idx % PIGEON_COLOR_PALETTE.length],
      })),
    [race.race_pigeons]
  );

  async function handlePigeonClick(pigeonId: string) {
    setLoadingPigeonId(pigeonId);
    const res = await getPigeonById(pigeonId);
    setLoadingPigeonId(null);
    if (!res.success) {
      toast.error("Greška", { description: res.error });
      return;
    }
    if (!res.data) {
      toast.error("Golub nije pronađen");
      return;
    }
    setOpenPigeon(res.data);
  }

  return (
    <div className="px-4 xl:px-5 2xl:px-6 py-4 xl:py-5 2xl:py-6 space-y-4 xl:space-y-5 2xl:space-y-6">
      <RaceHeader race={race} />
      <RaceChartCard race={race} pigeonsWithColor={pigeonsWithColor} />
      <RaceStatisticsTable
        pigeonsWithColor={pigeonsWithColor}
        goalAltitude={race.goal_altitude}
        onPigeonClick={handlePigeonClick}
        loadingPigeonId={loadingPigeonId}
      />
      <PigeonHistoryModal
        pigeon={openPigeon}
        isOpen={openPigeon !== null}
        onClose={() => setOpenPigeon(null)}
      />
    </div>
  );
}

function RaceHeader({ race }: { race: RaceWithDetails }) {
  const dateStr = new Date(race.started_at).toLocaleDateString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const durationSec = race.duration_seconds ?? 0;
  const ownerName = race.owner_profile
    ? `${race.owner_profile.first_name} ${race.owner_profile.last_name}`.trim() ||
      race.owner_profile.username
    : "—";
  const clubLabel = race.club ? race.club.name : "—";
  const { Icon: VisIcon, label: visLabel } = VISIBILITY_META[race.visibility];

  return (
    <div className="bg-bg-surface border border-accent/15 rounded-xl p-4 xl:p-5 2xl:p-6">
      <div className="flex items-start justify-between mb-3 xl:mb-3.5 2xl:mb-4 gap-3 xl:gap-3.5 2xl:gap-4 min-w-0">
        <h1 className="text-2xl xl:text-2xl 2xl:text-3xl font-bold text-text-primary font-rajdhani truncate min-w-0">
          {race.name}
        </h1>
        <span className="inline-flex items-center gap-1.5 px-2 xl:px-2.5 2xl:px-3 py-1 xl:py-1 2xl:py-1.5 rounded-md bg-bg-input border border-border text-xs xl:text-xs 2xl:text-sm text-text-secondary whitespace-nowrap flex-shrink-0">
          <VisIcon className="w-4 h-4" aria-hidden="true" />
          {visLabel}
        </span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 xl:gap-3.5 2xl:gap-4">
        <InfoItem icon={<Trophy className="w-4 h-4" />} label="Golubar" value={ownerName} />
        <InfoItem icon={<MapPin className="w-4 h-4" />} label="Društvo" value={clubLabel} />
        <InfoItem
          icon={<Clock className="w-4 h-4" />}
          label="Trajanje"
          value={durationSec > 0 ? formatDuration(durationSec) : "—"}
        />
        <InfoItem icon={<Calendar className="w-4 h-4" />} label="Datum" value={dateStr} />
      </div>
      {race.status !== "completed" && (
        <p className="mt-4 text-sm text-status-warning">
          {race.status === "in_progress"
            ? "Trka je još uvek u toku."
            : "Trka je otkazana."}
        </p>
      )}
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-text-tertiary font-medium mb-1">
        {icon}
        {label}
      </div>
      <div className="text-text-primary font-medium">{value}</div>
    </div>
  );
}

interface ChartPigeonRow {
  id: string;
  pigeon_id: string | null;
  pigeon_full_ring_number: string;
  pigeon_color: string;
  pigeon_name: string | null;
  pigeon: { is_archived: boolean } | null;
  chartColor: string;
  readings: { altitude: number; elapsed_seconds: number }[];
  max_altitude: number | null;
  avg_altitude: number | null;
  reached_goal: boolean;
}

function RaceChartCard({
  race,
  pigeonsWithColor,
}: {
  race: RaceWithDetails;
  pigeonsWithColor: ChartPigeonRow[];
}) {
  const chartData = useMemo(() => {
    if (pigeonsWithColor.length === 0) return [];
    const elapsedSet = new Set<number>();
    for (const p of pigeonsWithColor) {
      for (const r of p.readings) elapsedSet.add(r.elapsed_seconds);
    }
    const elapsedSorted = Array.from(elapsedSet).sort((a, b) => a - b);

    return elapsedSorted.map((es) => {
      const point: Record<string, number> = { elapsedMinutes: parseFloat((es / 60).toFixed(4)) };
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
    let maxAlt = race.goal_altitude;
    for (const p of pigeonsWithColor) {
      if ((p.max_altitude ?? 0) > maxAlt) maxAlt = p.max_altitude ?? maxAlt;
    }
    return computeYAxisConfig(maxAlt);
  }, [pigeonsWithColor, race.goal_altitude]);

  const chartPigeons = useMemo(
    () =>
      pigeonsWithColor.map((p) => ({
        id: p.id,
        name: p.pigeon_full_ring_number,
        color: p.chartColor,
      })),
    [pigeonsWithColor]
  );

  return (
    <div className="bg-bg-surface border border-accent/15 rounded-xl p-4 xl:p-5 2xl:p-6">
      <div className="mb-3 xl:mb-3.5 2xl:mb-4">
        <h2 className="text-xl xl:text-xl 2xl:text-2xl font-bold text-text-primary font-rajdhani">
          Visina kroz vreme
        </h2>
        <p className="text-sm xl:text-sm 2xl:text-base text-text-tertiary">Replay celog leta</p>
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
          height={500}
        />
      )}
    </div>
  );
}

const VIS_THRESHOLD_M = 800;
const READING_INTERVAL_S = 5;

function computeFlightStats(
  readings: { altitude: number; elapsed_seconds: number }[]
) {
  if (readings.length === 0) {
    return { totalSec: 0, aboveSec: 0, pctAbove: 0 };
  }
  const totalSec = readings.length * READING_INTERVAL_S;
  const aboveSec =
    readings.filter((r) => r.altitude >= VIS_THRESHOLD_M).length *
    READING_INTERVAL_S;
  const pctAbove = totalSec > 0 ? (aboveSec / totalSec) * 100 : 0;
  return { totalSec, aboveSec, pctAbove };
}

function formatTimeShort(totalSeconds: number): string {
  if (totalSeconds <= 0) return "—";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function RaceStatisticsTable({
  pigeonsWithColor,
  goalAltitude,
  onPigeonClick,
  loadingPigeonId,
}: {
  pigeonsWithColor: ChartPigeonRow[];
  goalAltitude: number;
  onPigeonClick: (pigeonId: string) => void;
  loadingPigeonId: string | null;
}) {
  void goalAltitude;
  const aggregateTime = useMemo(() => {
    const totals = pigeonsWithColor.map(
      (p) => computeFlightStats(p.readings).totalSec
    );
    const sumSec = totals.reduce((a, b) => a + b, 0);
    const avgSec = totals.length > 0 ? Math.round(sumSec / totals.length) : 0;
    return { sumSec, avgSec };
  }, [pigeonsWithColor]);

  return (
    <div className="bg-bg-surface border border-accent/15 rounded-xl overflow-hidden">
      <div className="p-4 xl:p-5 2xl:p-6 pb-3 xl:pb-3.5 2xl:pb-4">
        <h2 className="text-xl xl:text-xl 2xl:text-2xl font-bold text-text-primary font-rajdhani">
          Izveštaj po golubu
        </h2>
        <p className="text-sm xl:text-sm 2xl:text-base text-text-tertiary">
          Let je validan ako je golub više od 50% trajanja trke proveo iznad {VIS_THRESHOLD_M}m.
        </p>
      </div>
      <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="table-header-gradient text-xs uppercase text-text-tertiary font-medium">
          <tr>
            <th className="text-left py-3 px-6">Golub</th>
            <th className="text-left py-3 pl-0 pr-4">Boja</th>
            <th className="text-left py-3 px-4">Ukupno vreme</th>
            <th className="text-left py-3 px-4">Vreme iznad {VIS_THRESHOLD_M}m</th>
            <th className="text-left py-3 px-4">Max visina</th>
            <th className="text-left py-3 px-4">Postigao VIS</th>
            <th className="text-left py-3 px-4">Validan let</th>
          </tr>
        </thead>
        <tbody>
          {pigeonsWithColor.map((rp) => {
            const clickable =
              rp.pigeon_id !== null && rp.pigeon?.is_archived === false;
            const loading = loadingPigeonId === rp.pigeon_id;
            const stats = computeFlightStats(rp.readings);
            const reachedVis = (rp.max_altitude ?? 0) >= VIS_THRESHOLD_M;
            const validFlight = stats.pctAbove > 50;
            return (
            <tr key={rp.id} className="border-t border-border">
              <td className="py-4 px-6">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: rp.chartColor }}
                  />
                  {clickable ? (
                    <button
                      type="button"
                      onClick={() => onPigeonClick(rp.pigeon_id!)}
                      disabled={loading}
                      className="text-text-primary font-medium hover:text-accent transition-colors disabled:opacity-60 whitespace-nowrap"
                    >
                      {rp.pigeon_full_ring_number}
                    </button>
                  ) : (
                    <span className="text-text-primary font-medium cursor-default whitespace-nowrap">
                      {rp.pigeon_full_ring_number}
                    </span>
                  )}
                </div>
              </td>
              <td className="py-4 pl-0 pr-4 text-text-secondary whitespace-nowrap">{rp.pigeon_color}</td>
              <td className="py-4 px-4 text-text-secondary whitespace-nowrap">
                {formatTimeShort(stats.totalSec)}
              </td>
              <td className="py-4 px-4 text-text-secondary whitespace-nowrap">
                {stats.totalSec > 0 ? (
                  <>
                    {formatTimeShort(stats.aboveSec)}
                    <span className="text-text-tertiary ml-1">
                      ({stats.pctAbove.toFixed(0)}%)
                    </span>
                  </>
                ) : (
                  "—"
                )}
              </td>
              <td className="py-4 px-4 text-accent font-semibold whitespace-nowrap">
                {rp.max_altitude != null ? `${rp.max_altitude}m` : "—"}
              </td>
              <td className="py-4 px-4">
                {reachedVis ? (
                  <div className="flex items-center gap-2 text-status-success">
                    <Check className="w-5 h-5" aria-hidden="true" />
                    <span className="text-sm font-medium">Da</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-status-error">
                    <X className="w-5 h-5" aria-hidden="true" />
                    <span className="text-sm font-medium">Ne</span>
                  </div>
                )}
              </td>
              <td className="py-4 px-4">
                {validFlight ? (
                  <div className="flex items-center gap-2 text-status-success">
                    <Check className="w-5 h-5" aria-hidden="true" />
                    <span className="text-sm font-medium">Da</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-status-error">
                    <X className="w-5 h-5" aria-hidden="true" />
                    <span className="text-sm font-medium">Ne</span>
                  </div>
                )}
              </td>
            </tr>
            );
          })}
        </tbody>
        {pigeonsWithColor.length > 0 && (
          <tfoot>
            <tr className="border-t-4 border-border-strong bg-bg-hover/40">
              <td colSpan={2} className="py-3 px-6 whitespace-nowrap align-top text-text-primary font-semibold">
                <div>
                  <span className="text-accent mr-2" aria-hidden="true">Σ</span>
                  Zbirno
                </div>
                <div className="mt-1">
                  <span className="text-accent mr-2" aria-hidden="true">ø</span>
                  Prosečno
                </div>
              </td>
              <td className="py-3 px-4 whitespace-nowrap align-top text-text-primary font-semibold">
                <div>{formatTimeShort(aggregateTime.sumSec)}</div>
                <div className="mt-1">{formatTimeShort(aggregateTime.avgSec)}</div>
              </td>
              <td colSpan={4}></td>
            </tr>
          </tfoot>
        )}
      </table>
      </div>
    </div>
  );
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds}s`;
}

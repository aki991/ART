"use client";

import { useMemo, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, Trophy, MapPin, Clock, Check, X } from "lucide-react";
import {
  useRacesStore,
  type Race,
  type PigeonStatistics,
  type RacePigeon,
} from "@/lib/store/races-store";
import { computeYAxisConfig, buildXTicks } from "@/lib/utils/y-axis";
import { RaceAltitudeChart } from "@/components/shared/RaceAltitudeChart";

export default function RaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const raceId = params.id as string;

  const race = useRacesStore((s) => s.races.find((r) => r.id === raceId));

  if (!race) {
    return (
      <div className="px-6 py-6">
        <div className="bg-card-dark border border-cyan-brand/15 rounded-xl p-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-2 font-rajdhani">
            Trka nije pronađena
          </h2>
          <p className="text-white/60 mb-4">
            Možda je obrisana ili ID nije ispravan.
          </p>
          <button
            type="button"
            onClick={() => router.push("/races")}
            className="px-4 py-2 bg-cyan-brand hover:bg-cyan-dark text-white rounded-md transition-colors"
          >
            Vrati se na listu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-6 space-y-6">
      <RaceHeader race={race} />
      <RaceChartCard race={race} />
      <RaceStatisticsTable race={race} />
    </div>
  );
}

function RaceHeader({ race }: { race: Race }) {
  const dateStr = new Date(race.startedAt).toLocaleDateString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const durationSec = Math.floor((race.endedAt - race.startedAt) / 1000);

  return (
    <div className="bg-card-dark border border-cyan-brand/15 rounded-xl p-6">
      <h1 className="text-3xl font-bold text-white font-rajdhani mb-4">
        {race.name}
      </h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoItem icon={<Trophy className="w-4 h-4" />} label="Golubar" value={race.owner} />
        <InfoItem icon={<MapPin className="w-4 h-4" />} label="Klub" value={race.club} />
        <InfoItem icon={<Clock className="w-4 h-4" />} label="Trajanje" value={formatDuration(durationSec)} mono />
        <InfoItem icon={<Calendar className="w-4 h-4" />} label="Datum" value={dateStr} mono />
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value, mono }: { icon: ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/50 font-medium mb-1">
        {icon}
        {label}
      </div>
      <div className={`text-white font-medium${mono ? " font-mono" : ""}`}>{value}</div>
    </div>
  );
}

function RaceChartCard({ race }: { race: Race }) {
  const chartData = useMemo(() => {
    if (race.readings.length === 0) return [];
    const startTimestamp = race.readings[0].timestamp;
    return race.readings.map((reading) => ({
      elapsedMinutes: parseFloat(
        ((reading.timestamp - startTimestamp) / 1000 / 60).toFixed(4)
      ),
      ...reading.altitudes,
    }));
  }, [race.readings]);

  const xMaxMinutes = useMemo(
    () =>
      Math.max(
        1,
        chartData.length > 0
          ? Math.ceil(chartData[chartData.length - 1].elapsedMinutes)
          : 1
      ),
    [chartData]
  );

  const xTicks = useMemo(() => buildXTicks(xMaxMinutes), [xMaxMinutes]);

  const yAxisConfig = useMemo(() => {
    let maxAlt = 0;
    for (const reading of chartData) {
      for (const pigeon of race.pigeons) {
        const alt = reading[pigeon.id as keyof typeof reading];
        if (typeof alt === "number" && alt > maxAlt) maxAlt = alt;
      }
    }
    return computeYAxisConfig(maxAlt);
  }, [chartData, race.pigeons]);

  return (
    <div className="bg-card-dark border border-cyan-brand/15 rounded-xl p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white font-rajdhani">
          Visina kroz vreme
        </h2>
        <p className="text-base text-white/60">Replay celog leta</p>
      </div>

      <RaceAltitudeChart
        chartData={chartData}
        pigeons={race.pigeons}
        xMaxMinutes={xMaxMinutes}
        xTicks={xTicks}
        yAxisConfig={yAxisConfig}
        height={500}
      />
    </div>
  );
}

function RaceStatisticsTable({ race }: { race: Race }) {
  return (
    <div className="bg-card-dark border border-cyan-brand/15 rounded-xl overflow-hidden">
      <div className="p-6 pb-4">
        <h2 className="text-2xl font-bold text-white font-rajdhani">
          Izveštaj po golubu
        </h2>
      </div>
      <table className="w-full">
        <thead className="table-header-gradient text-xs uppercase text-white/50 font-medium">
          <tr>
            <th className="text-left py-3 px-6">Golub</th>
            <th className="text-left py-3 px-4">Trajanje leta</th>
            <th className="text-left py-3 px-4">Vreme iznad 800m</th>
            <th className="text-left py-3 px-4">Max visina</th>
            <th className="text-left py-3 px-4">Validan let</th>
          </tr>
        </thead>
        <tbody>
          {race.statistics.map((stat) => {
            const pigeon = race.pigeons.find((p) => p.id === stat.pigeonId);
            if (!pigeon) return null;
            return <PigeonStatRow key={stat.pigeonId} pigeon={pigeon} stat={stat} />;
          })}
        </tbody>
      </table>
    </div>
  );
}

function PigeonStatRow({ pigeon, stat }: { pigeon: RacePigeon; stat: PigeonStatistics }) {
  return (
    <tr className="border-t border-white/5">
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: pigeon.color }}
          />
          <span className="text-white font-medium">{pigeon.name}</span>
        </div>
      </td>
      <td className="py-4 px-4 text-white/80 font-mono">
        {formatDuration(stat.totalDurationSeconds)}
      </td>
      <td className="py-4 px-4 text-white/80 font-mono">
        {formatDuration(stat.timeAbove800Seconds)}
      </td>
      <td className="py-4 px-4 text-cyan-brand font-mono font-semibold">{stat.maxAltitude}m</td>
      <td className="py-4 px-4">
        {stat.validFlight ? (
          <div className="flex items-center gap-2 text-green-400">
            <Check className="w-5 h-5" aria-hidden="true" />
            <span className="text-sm font-medium">Validan</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-400">
            <X className="w-5 h-5" aria-hidden="true" />
            <span className="text-sm font-medium">Nije validan</span>
          </div>
        )}
      </td>
    </tr>
  );
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds}s`;
}

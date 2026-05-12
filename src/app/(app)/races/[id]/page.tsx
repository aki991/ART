"use client";

import { useMemo, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Trophy, MapPin, Clock, Check, X } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import {
  useRacesStore,
  type Race,
  type PigeonStatistics,
  type RacePigeon,
} from "@/lib/store/races-store";
import { computeYAxisConfig } from "@/lib/utils/y-axis";

const TICK_STYLE = { fill: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 600 };
const AXIS_LINE = { stroke: "rgba(255,255,255,0.12)" };

interface TooltipEntry {
  dataKey: string;
  name: string;
  value: number;
  color: string;
}

function ReplayTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const timeLabel = (() => {
    if (typeof label !== "number") return "";
    const totalSeconds = Math.round(label * 60);
    if (totalSeconds < 60) return `${totalSeconds}s`;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  })();
  return (
    <div
      style={{
        background: "rgba(9,45,65,0.95)",
        border: "1px solid rgba(0,210,255,0.3)",
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 14,
      }}
    >
      <div style={{ color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>{timeLabel}</div>
      {payload.map((entry) => (
        <div
          key={entry.dataKey}
          style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: entry.color,
              flexShrink: 0,
            }}
          />
          <span style={{ color: entry.color }}>{entry.name}</span>
          <span style={{ color: "rgba(255,255,255,0.8)", fontFamily: "monospace", marginLeft: 2 }}>
            : {Math.round(entry.value)}m
          </span>
        </div>
      ))}
    </div>
  );
}

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

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/races");
    }
  }

  return (
    <div className="px-6 py-6 space-y-6">
      <RaceHeader race={race} onBack={handleBack} />
      <RaceChartCard race={race} />
      <RaceStatisticsTable race={race} />
    </div>
  );
}

function RaceHeader({ race, onBack }: { race: Race; onBack: () => void }) {
  const dateStr = new Date(race.startedAt).toLocaleDateString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const durationSec = Math.floor((race.endedAt - race.startedAt) / 1000);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Nazad
      </button>

      <div className="bg-card-dark border border-cyan-brand/15 rounded-xl p-6">
        <h1 className="text-3xl font-bold text-white font-rajdhani mb-4">
          {race.name}
        </h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoItem icon={<Trophy className="w-4 h-4" />} label="Golubar" value={race.owner} />
          <InfoItem icon={<MapPin className="w-4 h-4" />} label="Klub" value={race.club} />
          <InfoItem icon={<Clock className="w-4 h-4" />} label="Trajanje" value={formatDuration(durationSec)} />
          <InfoItem icon={<Calendar className="w-4 h-4" />} label="Datum" value={dateStr} />
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/50 font-medium mb-1">
        {icon}
        {label}
      </div>
      <div className="text-white font-medium">{value}</div>
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

  const maxMinutes = Math.max(
    1,
    chartData.length > 0
      ? Math.ceil(chartData[chartData.length - 1].elapsedMinutes)
      : 1
  );

  const xAxisTicks = useMemo(() => {
    const tickCount = Math.min(Math.ceil(maxMinutes) + 1, 11);
    if (tickCount <= 1) return [0];
    const step = maxMinutes / (tickCount - 1);
    return Array.from({ length: tickCount }, (_, i) =>
      Math.round(i * step * 100) / 100
    );
  }, [maxMinutes]);

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

      <div className="h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 4, right: 80, bottom: 4, left: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="elapsedMinutes"
              type="number"
              domain={[0, maxMinutes]}
              ticks={xAxisTicks}
              tickFormatter={(v: number) => `${v}min`}
              tick={TICK_STYLE}
              axisLine={AXIS_LINE}
              tickLine={AXIS_LINE}
            />
            <YAxis
              domain={yAxisConfig.domain}
              ticks={yAxisConfig.ticks}
              tickFormatter={(v: number) => `${v}m`}
              tick={TICK_STYLE}
              axisLine={AXIS_LINE}
              tickLine={AXIS_LINE}
              width={52}
            />
            <Tooltip content={<ReplayTooltip />} />
            <ReferenceLine
              y={800}
              stroke="#FBBF24"
              strokeWidth={2}
              strokeDasharray="6 4"
              label={{
                value: "Cilj: 800m",
                position: "right",
                fill: "#FBBF24",
                fontSize: 13,
                fontWeight: 600,
              }}
            />
            {race.pigeons.map((pigeon) => (
              <Line
                key={pigeon.id}
                type="monotone"
                dataKey={pigeon.id}
                stroke={pigeon.color}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5, fill: pigeon.color }}
                name={pigeon.name}
                isAnimationActive={false}
              />
            ))}
            <Legend
              wrapperStyle={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.8)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
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
      <td className="py-4 px-4 text-cyan-brand font-semibold">{stat.maxAltitude}m</td>
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

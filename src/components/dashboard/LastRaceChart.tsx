"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trophy, User, Calendar, Clock, ArrowRight } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { useRacesStore } from "@/lib/store/races-store";
import { computeYAxisConfig } from "@/lib/utils/y-axis";

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
      time: (reading.timestamp - lastRace.startedAt) / 1000 / 60,
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

  const yAxisConfig = computeYAxisConfig(maxAltitude);

  const xMaxMinutes = Math.max(0.5, durationSeconds / 60);
  const xTicks = useMemo(() => {
    const numTicks = Math.min(11, Math.ceil(xMaxMinutes * 2) + 1);
    return Array.from({ length: numTicks }, (_, i) =>
      (i * xMaxMinutes) / (numTicks - 1)
    );
  }, [xMaxMinutes]);

  if (!lastRace) {
    return (
      <div className="card-redesign p-12 text-center">
        <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Još nema snimljenih trka
        </h3>
        <p className="text-gray-500 mb-4">
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
            <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">
              Poslednja trka
            </span>
          </div>
          <div className="flex items-center gap-1 text-cyan-brand text-sm font-medium">
            Vidi detalje
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{lastRace.name}</h2>
          <div className="flex items-center gap-5 text-base text-gray-600">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-gray-400" aria-hidden="true" />
              {lastRace.owner}
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-400" aria-hidden="true" />
              {formatDate(lastRace.startedAt)}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gray-400" aria-hidden="true" />
              {formatDuration(durationSeconds)}
            </div>
          </div>
        </div>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 80, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="time"
              type="number"
              domain={[0, xMaxMinutes]}
              ticks={xTicks}
              tickFormatter={(v: number) => {
                if (v === 0) return "0min";
                if (v < 1) return `${Math.round(v * 60)}s`;
                return `${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}min`;
              }}
              tick={{ fontSize: 12, fill: "#6B7280" }}
              stroke="#9CA3AF"
            />
            <YAxis
              domain={yAxisConfig.domain}
              ticks={yAxisConfig.ticks}
              tickFormatter={(v: number) => `${v}m`}
              tick={{ fontSize: 12, fill: "#6B7280" }}
              stroke="#9CA3AF"
              width={52}
            />
            <Tooltip content={<ChartTooltip />} />
            <ReferenceLine
              y={800}
              stroke="#FBBF24"
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{
                value: "Cilj: 800m",
                position: "right",
                fill: "#FBBF24",
                fontSize: 11,
                fontWeight: 600,
              }}
            />
            {lastRace.pigeons.map((pigeon) => (
              <Line
                key={pigeon.id}
                type="monotone"
                dataKey={pigeon.id}
                name={pigeon.name}
                stroke={pigeon.color}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: pigeon.color }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface TooltipEntry {
  dataKey: string;
  name: string;
  value: number;
  color: string;
}

function ChartTooltip({
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
    const s = Math.round(label * 60);
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  })();
  return (
    <div
      style={{
        background: "#1F2937",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 13,
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

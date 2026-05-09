"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTelemetryStore } from "@/lib/store/telemetry-store";

export function AltitudeChart() {
  const readings = useTelemetryStore((s) => s.readings);
  const profiles = useTelemetryStore((s) => s.profiles);
  const isPaused = useTelemetryStore((s) => s.isPaused);

  const chartData = useMemo(() => {
    if (profiles.length === 0) return [];
    const baseArr = readings.get(profiles[0].ringId) ?? [];
    if (baseArr.length === 0) return [];

    const lastTs = baseArr[baseArr.length - 1].timestamp.getTime();

    return baseArr.map((baseReading, i) => {
      const relSec =
        Math.round(
          ((baseReading.timestamp.getTime() - lastTs) / 1000) * 10
        ) / 10;

      const point: Record<string, number> = { time: relSec };
      for (const p of profiles) {
        const arr = readings.get(p.ringId) ?? [];
        const r = arr[i];
        if (r !== undefined) {
          point[p.pigeonName] = parseFloat(r.altitudeMeters.toFixed(1));
        }
      }
      return point;
    });
  }, [readings, profiles]);

  const hasData = chartData.length > 0;

  return (
    <div className="card-redesign p-6 min-h-[480px] flex flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-semibold font-rajdhani text-gray-900">
          Visina kroz vreme
        </h2>
        <p className="text-sm text-gray-500">Poslednjih 2 minuta</p>
      </div>

      {!hasData ? (
        <div
          className="flex-1 flex items-center justify-center"
          aria-label="Čekamo prve podatke sa bazne stanice"
        >
          <p className="text-gray-400 text-sm font-rajdhani animate-pulse">
            Čekamo prve podatke...
          </p>
        </div>
      ) : (
        <div className="relative flex-1">
          {isPaused && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 rounded-lg">
              <span className="text-2xl font-bold font-rajdhani text-gray-500 tracking-widest">
                PAUZIRANO
              </span>
            </div>
          )}
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={chartData}
              aria-label="Graf visine golubova u poslednjih 2 minuta"
            >
              <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                type="number"
                domain={["dataMin", 0]}
                tickFormatter={(v: number) => (v === 0 ? "Sad" : `${v}s`)}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v}`}
                label={{
                  value: "m",
                  position: "insideTopLeft",
                  offset: 8,
                  fontSize: 11,
                  fill: "#6B7280",
                }}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
                formatter={(value) => [
                  typeof value === "number" ? `${value.toFixed(1)} m` : "—",
                  "",
                ]}
                labelFormatter={(label) =>
                  typeof label === "number"
                    ? label === 0
                      ? "Sad"
                      : `${label}s`
                    : ""
                }
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
              />
              {profiles.map((p) => (
                <Line
                  key={p.ringId}
                  type="monotone"
                  dataKey={p.pigeonName}
                  stroke={p.color}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

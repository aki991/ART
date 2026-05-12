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
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { useTelemetryStore } from "@/lib/store/telemetry-store";
import { useConnectionStore } from "@/lib/store/connection-store";
import { computeYAxisConfig } from "@/lib/utils/y-axis";

const TICK_STYLE = { fill: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 600 };
const AXIS_LINE = { stroke: "rgba(255,255,255,0.12)" };

function formatTooltipTime(elapsedMinutes: number): string {
  const totalSeconds = Math.round(elapsedMinutes * 60);
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
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
  return (
    <div
      style={{
        background: "#0F1C2E",
        border: "1px solid rgba(0,210,255,0.2)",
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 14,
      }}
    >
      <div style={{ color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>
        {typeof label === "number" ? formatTooltipTime(label) : ""}
      </div>
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
      const elapsedMinutes =
        parseFloat(((baseReading.timestamp.getTime() - firstTs) / 60000).toFixed(4));

      const point: Record<string, number> = { elapsedMinutes };
      for (const pigeon of activeRacePigeons) {
        const arr = readings.get(pigeon.id) ?? [];
        const r = arr[i];
        if (r !== undefined) {
          point[pigeon.name] = parseFloat(r.altitudeMeters.toFixed(1));
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

  const hasData = chartData.length > 0;

  return (
    <div className="bg-card-dark border border-cyan-brand/15 rounded-xl overflow-hidden p-6 h-full flex flex-col">
      <div className="flex-shrink-0 mb-6">
        <h2 className="text-3xl font-bold font-rajdhani text-white">
          Visina kroz vreme
        </h2>
        <p className="text-lg text-white/70">Poslednjih 2 minuta</p>
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
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              aria-label="Graf visine golubova u poslednjih 2 minuta"
              margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
            >
              <CartesianGrid stroke="rgba(255,255,255,0.07)" strokeDasharray="3 3" />
              <XAxis
                dataKey="elapsedMinutes"
                type="number"
                domain={[0, 2]}
                ticks={[0, 0.5, 1, 1.5, 2]}
                tickFormatter={(v: number) =>
                  v === 0 ? "0min" : v === 2 ? "2min" : `${v}min`
                }
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
              <Tooltip content={<ChartTooltip />} />
              <Legend
                wrapperStyle={{
                  fontSize: "14px",
                  fontWeight: 500,
                  paddingTop: "12px",
                  color: "rgba(255,255,255,0.8)",
                }}
              />
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
              {activeRacePigeons.map((pigeon) => (
                <Line
                  key={pigeon.id}
                  type="monotone"
                  dataKey={pigeon.name}
                  stroke={pigeon.color}
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 7, fill: pigeon.color }}
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

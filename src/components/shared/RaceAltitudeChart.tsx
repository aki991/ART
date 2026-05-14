"use client";

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

const TICK_STYLE = {
  fill: "rgba(255,255,255,0.7)",
  fontSize: 14,
  fontWeight: 600,
  fontFamily: "var(--font-geist-mono), 'SF Mono', Menlo, monospace",
};
const AXIS_LINE = { stroke: "rgba(255,255,255,0.12)" };

interface ChartPigeon {
  id: string;
  name: string;
  color: string;
}

interface TooltipEntry {
  dataKey: string;
  name: string;
  value: number;
  color: string;
}

function AltitudeTooltip({
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
        fontFamily: "var(--font-geist), system-ui, sans-serif",
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

interface RaceAltitudeChartProps {
  chartData: Record<string, number>[];
  pigeons: ChartPigeon[];
  xDataKey?: string;
  xMaxMinutes: number;
  xTicks: number[];
  yAxisConfig: { domain: [number, number]; ticks: number[] };
  height?: number | string;
}

export function RaceAltitudeChart({
  chartData,
  pigeons,
  xDataKey = "elapsedMinutes",
  xMaxMinutes,
  xTicks,
  yAxisConfig,
  height = 400,
}: RaceAltitudeChartProps) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 4, right: 80, bottom: 4, left: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey={xDataKey}
            type="number"
            domain={[0, xMaxMinutes]}
            ticks={xTicks}
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
          <Tooltip content={<AltitudeTooltip />} />
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
          {pigeons.map((pigeon) => (
            <Line
              key={pigeon.id}
              type="monotone"
              dataKey={pigeon.id}
              name={pigeon.name}
              stroke={pigeon.color}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, fill: pigeon.color }}
              isAnimationActive={false}
            />
          ))}
          <Legend
            wrapperStyle={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.8)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

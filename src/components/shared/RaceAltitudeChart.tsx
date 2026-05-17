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
import { useChartTheme } from "@/lib/hooks/useChartTheme";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

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
  tooltipBg,
  tooltipBorder,
  tooltipText,
  tooltipMuted,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: number;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  tooltipMuted: string;
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
        background: tooltipBg,
        border: `1px solid ${tooltipBorder}`,
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 14,
        fontFamily: "var(--font-geist), system-ui, sans-serif",
      }}
    >
      <div style={{ color: tooltipMuted, marginBottom: 6 }}>{timeLabel}</div>
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
          <span style={{ color: tooltipText, fontFamily: "monospace", marginLeft: 2 }}>
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
  const chartTheme = useChartTheme();
  const isMobile = useMediaQuery("(max-width: 1023px)");

  const tickStyle = {
    fill: chartTheme.textColor,
    fontSize: isMobile ? 10 : 14,
    fontWeight: 600,
    fontFamily: "var(--font-geist-mono), 'SF Mono', Menlo, monospace",
  };
  const axisLine = { stroke: chartTheme.gridStroke };

  const plotHeight = isMobile ? 240 : height;

  return (
    <div>
      <div style={{ height: plotHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 4, right: isMobile ? 8 : 80, bottom: isMobile ? 8 : 40, left: isMobile ? 0 : 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} />
          <XAxis
            dataKey={xDataKey}
            type="number"
            domain={[0, xMaxMinutes]}
            ticks={xTicks}
            tickFormatter={(v: number) => `${v}min`}
            tick={tickStyle}
            axisLine={axisLine}
            tickLine={axisLine}
          />
          <YAxis
            domain={yAxisConfig.domain}
            ticks={yAxisConfig.ticks}
            tickFormatter={(v: number) => `${v}m`}
            tick={tickStyle}
            axisLine={axisLine}
            tickLine={axisLine}
            width={isMobile ? 36 : 52}
          />
          <Tooltip
            content={
              <AltitudeTooltip
                tooltipBg={chartTheme.background}
                tooltipBorder={chartTheme.accentLine}
                tooltipText={chartTheme.textColor}
                tooltipMuted={chartTheme.axisStroke}
              />
            }
          />
          <ReferenceLine
            y={800}
            stroke={chartTheme.goalLineColor}
            strokeWidth={2}
            strokeDasharray="6 4"
            label={
              isMobile
                ? undefined
                : {
                    value: "Cilj: 800m",
                    position: "right",
                    fill: chartTheme.goalLineColor,
                    fontSize: 13,
                    fontWeight: 600,
                  }
            }
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
          {!isMobile && (
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{
                fontSize: 14,
                fontWeight: 500,
                color: chartTheme.textColor,
                paddingTop: 16,
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      </div>
      {isMobile && (
        <div
          className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 pt-2"
          style={{ fontSize: 11, fontWeight: 500, color: chartTheme.textColor }}
        >
          {pigeons.map((pigeon) => (
            <div key={pigeon.id} className="flex items-center gap-1.5">
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: pigeon.color,
                  display: "inline-block",
                }}
              />
              <span>{pigeon.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

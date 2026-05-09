"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DailyScanCount } from "@/lib/mock/dashboard-data";

const DAY_ABBR: Record<number, string> = {
  0: "Ned",
  1: "Pon",
  2: "Uto",
  3: "Sre",
  4: "Čet",
  5: "Pet",
  6: "Sub",
};

interface WeeklyScansChartProps {
  data: DailyScanCount[];
}

export function WeeklyScansChart({ data }: WeeklyScansChartProps) {
  const chartData = data.map((d) => ({
    day: DAY_ABBR[new Date(d.date).getDay()],
    scanCount: d.scanCount,
  }));

  return (
    <div className="card-redesign p-6">
      <h2 className="text-lg font-semibold font-rajdhani text-gray-900 mb-1">
        Skenovi u poslednjih 7 dana
      </h2>
      <p className="text-sm text-gray-500 mb-4">Broj registrovanih skenova po danu</p>
      <div style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00D2FF" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#00D2FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: "6px",
              }}
              formatter={(value) => [`${value ?? 0} skenova`, ""]}
            />
            <Area
              type="monotone"
              dataKey="scanCount"
              stroke="#00D2FF"
              strokeWidth={2.5}
              fill="url(#cyanGradient)"
              dot={{ fill: "#00D2FF", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

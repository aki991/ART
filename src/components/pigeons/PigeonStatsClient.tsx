"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bird, TrendingUp, Trophy, Clock, Target } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useChartTheme } from "@/lib/hooks/useChartTheme";
import { formatTimeShort } from "@/lib/utils/flight-stats";
import type { PigeonStats } from "@/app/actions/pigeons";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Props {
  data: PigeonStats;
}

export function PigeonStatsClient({ data }: Props) {
  const router = useRouter();
  const chartTheme = useChartTheme();
  const { pigeon, stats, trend, history } = data;

  return (
    <div className="px-4 lg:px-8 py-4 lg:py-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-text-tertiary hover:text-text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          Nazad
        </button>

        <h1 className="text-2xl lg:text-3xl font-bold text-text-primary font-rajdhani">
          {pigeon.full_ring_number}
        </h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-sm text-text-tertiary">
          {pigeon.name && (
            <span className="text-text-secondary font-medium">{pigeon.name}</span>
          )}
          <span>
            Boja:{" "}
            <span className="text-text-secondary font-medium">{pigeon.color}</span>
          </span>
          <span>Dodat: {formatDate(pigeon.created_at)}</span>
        </div>
      </div>

      {/* STATISTIKE */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <StatCard
          icon={<Bird className="w-5 h-5" />}
          label="Ukupno letova"
          value={stats.total_races.toString()}
          subtitle={`${stats.valid_races} validnih · ${stats.cancelled_races} otkazanih`}
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Uspešnost"
          value={`${stats.valid_percentage}%`}
          subtitle={`${stats.invalid_races} nevalidnih (od završenih)`}
        />
        <StatCard
          icon={<Trophy className="w-5 h-5" />}
          label="Max visina ikad"
          value={`${stats.highest_altitude_ever}m`}
          subtitle={
            stats.highest_altitude_race_id ? (
              <Link
                href={`/races/${stats.highest_altitude_race_id}`}
                className="text-accent hover:underline"
              >
                vidi let →
              </Link>
            ) : null
          }
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Najduži let"
          value={formatTimeShort(stats.longest_flight_seconds)}
          subtitle={
            stats.longest_flight_race_id ? (
              <Link
                href={`/races/${stats.longest_flight_race_id}`}
                className="text-accent hover:underline"
              >
                vidi let →
              </Link>
            ) : null
          }
        />
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Prosečna max visina"
          value={`${stats.avg_max_altitude}m`}
          subtitle="validni letovi"
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Prosek iznad 800m"
          value={formatTimeShort(stats.avg_time_above_goal_seconds)}
          subtitle="validni letovi"
        />
      </div>

      {/* GRAFIKON TRENDA */}
      {trend.length > 1 ? (
        <div className="bg-bg-surface border border-accent/15 rounded-xl p-4 lg:p-6 mb-6">
          <h2 className="text-lg lg:text-xl font-bold text-text-primary font-rajdhani">
            Trend max visine kroz vreme
          </h2>
          <p className="text-sm text-text-tertiary mb-4">
            Kako se golub razvija kroz letove
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trend} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} />
              <XAxis
                dataKey="race_date"
                tickFormatter={formatDate}
                tick={{ fill: chartTheme.textColor, fontSize: 12 }}
                stroke={chartTheme.gridStroke}
              />
              <YAxis
                tick={{ fill: chartTheme.textColor, fontSize: 12 }}
                stroke={chartTheme.gridStroke}
                width={52}
                domain={[0, (dataMax: number) => Math.ceil((dataMax * 1.1) / 200) * 200]}
                tickFormatter={(value: number) => `${value}m`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: chartTheme.background,
                  border: `1px solid ${chartTheme.gridStroke}`,
                  borderRadius: 8,
                  fontSize: 13,
                }}
                labelStyle={{ color: chartTheme.axisStroke }}
                itemStyle={{ color: chartTheme.textColor }}
                labelFormatter={(label) => formatDate(String(label))}
                formatter={(value) => [`${value}m`, "Max visina"]}
              />
              <Line
                type="monotone"
                dataKey="max_altitude"
                name="Max visina"
                stroke={chartTheme.accentLine}
                strokeWidth={2}
                dot={{ r: 4, fill: chartTheme.accentLine }}
                activeDot={{ r: 6 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-bg-surface border border-accent/15 rounded-xl p-8 mb-6 text-center text-text-tertiary">
          Potrebna su najmanje 2 završena leta za prikaz trenda.
        </div>
      )}

      {/* ISTORIJA LETOVA */}
      <div className="bg-bg-surface border border-accent/15 rounded-xl overflow-hidden">
        <div className="p-4 lg:p-6 border-b border-border">
          <h2 className="text-lg lg:text-xl font-bold text-text-primary font-rajdhani">
            Istorija letova
          </h2>
          <p className="text-sm text-text-tertiary mt-1">
            Svi letovi u kojima je {pigeon.name || pigeon.full_ring_number}{" "}
            učestvovao
          </p>
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-center text-text-tertiary">
            Nema letova za prikaz.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-header-gradient text-xs uppercase text-text-tertiary font-medium">
                <tr>
                  <th className="text-left py-3 px-4 whitespace-nowrap">Naziv</th>
                  <th className="text-left py-3 px-4 whitespace-nowrap">Datum</th>
                  <th className="text-left py-3 px-4 whitespace-nowrap">Trajanje</th>
                  <th className="text-left py-3 px-4 whitespace-nowrap">Max visina</th>
                  <th className="text-left py-3 px-4 whitespace-nowrap">% iznad 800m</th>
                  <th className="text-left py-3 px-4 whitespace-nowrap">Validan</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr
                    key={row.race_id}
                    onClick={() => router.push(`/races/${row.race_id}`)}
                    className="border-t border-border cursor-pointer hover:bg-bg-hover transition-colors text-sm"
                  >
                    <td className="py-3 px-4 text-text-primary font-medium">
                      {row.race_name}
                      {row.race_status === "active" && (
                        <span className="ml-2 inline-flex items-center gap-1 text-xs text-status-error">
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-status-error animate-pulse"
                            aria-hidden="true"
                          />
                          U TOKU
                        </span>
                      )}
                      {row.race_status === "cancelled" && (
                        <span className="ml-2 text-xs text-text-tertiary">
                          (otkazan)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-text-secondary whitespace-nowrap">
                      {formatDateTime(row.race_date)}
                    </td>
                    <td className="py-3 px-4 text-text-secondary whitespace-nowrap">
                      {formatTimeShort(row.duration_seconds)}
                    </td>
                    <td className="py-3 px-4 text-accent font-semibold whitespace-nowrap">
                      {row.max_altitude !== null ? `${row.max_altitude}m` : "—"}
                    </td>
                    <td className="py-3 px-4 text-text-secondary whitespace-nowrap">
                      {row.race_status === "completed"
                        ? `${row.percentage_above_goal}%`
                        : "—"}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {row.race_status !== "completed" ? (
                        <span className="text-text-tertiary">—</span>
                      ) : row.is_valid ? (
                        <span className="text-status-success font-semibold">
                          ✓ DA
                        </span>
                      ) : (
                        <span className="text-status-error font-semibold">
                          ✗ NE
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtitle,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  subtitle?: ReactNode;
}) {
  return (
    <div className="bg-bg-surface border border-accent/15 rounded-xl p-4">
      <div className="flex items-center gap-2 text-text-tertiary mb-2">
        {icon}
        <span className="text-xs uppercase tracking-wide font-medium">
          {label}
        </span>
      </div>
      <div className="text-2xl lg:text-3xl font-bold text-text-primary font-rajdhani">
        {value}
      </div>
      {subtitle && (
        <div className="text-xs text-text-tertiary mt-1">{subtitle}</div>
      )}
    </div>
  );
}

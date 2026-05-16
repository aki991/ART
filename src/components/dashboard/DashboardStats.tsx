import { Bird, Trophy, CheckCircle2, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import type { RaceStatsAggregation } from "@/lib/types/race";

interface DashboardStatsProps {
  stats: RaceStatsAggregation;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 xl:gap-4 2xl:gap-6">
      <StatCard
        icon={Bird}
        value={stats.totalPigeons}
        label="Golubovi"
        accentColor="cyan"
      />
      <StatCard
        icon={Trophy}
        value={stats.totalRaces}
        label="Trka"
        accentColor="cyan"
      />
      <StatCard
        icon={CheckCircle2}
        value={stats.validRaces}
        label="Validnih trka"
        accentColor="cyan"
      />
      <StatCard
        icon={TrendingUp}
        value={stats.maxAltitude > 0 ? `${stats.maxAltitude}m` : "—"}
        label="Max visina"
        accentColor="cyan"
      />
    </div>
  );
}

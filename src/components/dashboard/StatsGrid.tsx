import { Bird, Users, Trophy, Radio } from "lucide-react";
import { getMockStats } from "@/lib/mock/dashboard-data";
import { StatCard } from "./StatCard";

export function StatsGrid() {
  const stats = getMockStats();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        label="Golubovi"
        value={stats.totalPigeons}
        icon={Bird}
        accentColor="cyan"
        trend={{ value: "+3 ove nedelje", direction: "up" }}
      />
      <StatCard
        label="Vlasnici"
        value={stats.totalOwners}
        icon={Users}
        accentColor="cyan"
      />
      <StatCard
        label="Aktivne trke"
        value={stats.activeRaces}
        icon={Trophy}
        accentColor="copper"
      />
      <StatCard
        label="Skenova ove nedelje"
        value={stats.totalScansThisWeek}
        icon={Radio}
        accentColor="neutral"
        trend={{ value: "+12% vs prošla", direction: "up" }}
      />
    </div>
  );
}

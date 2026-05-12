"use client";

import { useMemo } from "react";
import { Bird, Trophy, CheckCircle2, TrendingUp } from "lucide-react";
import { usePigeonsStore } from "@/lib/store/pigeons-store";
import { useRacesStore } from "@/lib/store/races-store";
import { StatCard } from "@/components/dashboard/StatCard";

export function DashboardStats() {
  const pigeons = usePigeonsStore((s) => s.pigeons);
  const races = useRacesStore((s) => s.races);

  const stats = useMemo(() => {
    const totalPigeons = pigeons.length;
    const totalRaces = races.length;

    const validRaces = races.filter((race) =>
      race.statistics.some((s) => s.validFlight)
    ).length;

    const allMaxAltitudes = races.flatMap((race) =>
      race.statistics.map((s) => s.maxAltitude)
    );
    const maxAltitudeEver =
      allMaxAltitudes.length > 0 ? Math.max(...allMaxAltitudes) : 0;

    return { totalPigeons, totalRaces, validRaces, maxAltitudeEver };
  }, [pigeons, races]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
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
        value={stats.maxAltitudeEver > 0 ? `${stats.maxAltitudeEver}m` : "—"}
        label="Max visina"
        accentColor="cyan"
      />
    </div>
  );
}

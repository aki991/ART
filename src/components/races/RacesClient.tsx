"use client";

import { Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRacesStore } from "@/lib/store/races-store";
import type { Race } from "@/lib/store/races-store";

export function RacesClient() {
  const races = useRacesStore((s) => s.races);

  return (
    <div className="px-6 py-6">
      {races.length === 0 ? <EmptyState /> : <ResultsTable races={races} />}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-bg-surface border border-accent/15 rounded-xl p-12 text-center">
      <Trophy className="w-16 h-16 text-text-disabled mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-text-primary mb-2 font-rajdhani">
        Još nema rezultata
      </h2>
      <p className="text-text-tertiary">
        Poveži uređaj na stranici &quot;Povezivanje uređaja&quot; i sačekaj kraj trke.
      </p>
    </div>
  );
}

function ResultsTable({ races }: { races: Race[] }) {
  return (
    <div className="bg-bg-surface border border-accent/15 rounded-xl overflow-hidden">
      <table className="w-full">
        <thead className="table-header-gradient text-xs uppercase text-text-tertiary font-medium">
          <tr>
            <th className="text-left py-3 px-4">Naziv</th>
            <th className="text-left py-3 px-4">Golubar</th>
            <th className="text-left py-3 px-4">Klub</th>
            <th className="text-left py-3 px-4">Trajanje</th>
            <th className="text-left py-3 px-4">Prosečna visina</th>
            <th className="text-left py-3 px-4">Max visina</th>
            <th className="text-left py-3 px-4">Datum</th>
          </tr>
        </thead>
        <tbody>
          {races.map((race) => (
            <ResultRow key={race.id} race={race} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResultRow({ race }: { race: Race }) {
  const router = useRouter();
  const avgOfAvgs =
    race.statistics.length > 0
      ? Math.round(
          race.statistics.reduce((sum, s) => sum + s.avgAltitude, 0) /
            race.statistics.length
        )
      : 0;
  const maxOfMaxs =
    race.statistics.length > 0
      ? Math.max(...race.statistics.map((s) => s.maxAltitude))
      : 0;

  const durationSec = Math.floor((race.endedAt - race.startedAt) / 1000);
  const dateStr = new Date(race.startedAt).toLocaleDateString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <tr
      onClick={() => router.push(`/races/${race.id}`)}
      className="border-t border-border hover:bg-bg-hover cursor-pointer transition-colors"
    >
      <td className="py-4 px-4 text-text-primary font-medium">{race.name}</td>
      <td className="py-4 px-4 text-text-secondary">{race.owner}</td>
      <td className="py-4 px-4 text-text-secondary">Klub {race.club}</td>
      <td className="py-4 px-4 text-text-secondary font-mono">{formatDuration(durationSec)}</td>
      <td className="py-4 px-4 text-accent font-semibold">{avgOfAvgs}m</td>
      <td className="py-4 px-4 text-accent font-semibold">{maxOfMaxs}m</td>
      <td className="py-4 px-4 text-text-tertiary text-sm">{dateStr}</td>
    </tr>
  );
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds}s`;
}

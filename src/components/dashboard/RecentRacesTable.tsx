"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trophy, ArrowRight, Check, X } from "lucide-react";
import { useRacesStore, type Race } from "@/lib/store/races-store";

export function RecentRacesTable() {
  const router = useRouter();
  const races = useRacesStore((s) => s.races);

  const recentRaces = useMemo(
    () => [...races].sort((a, b) => b.startedAt - a.startedAt).slice(0, 3),
    [races]
  );

  return (
    <div className="card-redesign p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white/80 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-cyan-brand" aria-hidden="true" />
          Poslednje trke
        </h2>
        <Link
          href="/races"
          className="text-sm text-cyan-brand hover:text-cyan-dark flex items-center gap-1 transition-colors"
        >
          Vidi sve
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>

      {recentRaces.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-white/20 mx-auto mb-4" aria-hidden="true" />
          <p className="text-white/60 mb-1">Još nema trka.</p>
          <Link href="/scanning" className="text-sm text-cyan-brand hover:underline">
            Pokreni prvu trku →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full">
            <thead className="bg-white/5 text-xs uppercase text-white/60 font-medium">
              <tr>
                <th className="text-left py-3 px-4">Naziv</th>
                <th className="text-left py-3 px-4">Datum</th>
                <th className="text-left py-3 px-4">Trajanje</th>
                <th className="text-left py-3 px-4">Golubova</th>
                <th className="text-left py-3 px-4">Validna</th>
              </tr>
            </thead>
            <tbody>
              {recentRaces.map((race) => (
                <RaceRow
                  key={race.id}
                  race={race}
                  onClick={() => router.push(`/races/${race.id}`)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RaceRow({ race, onClick }: { race: Race; onClick: () => void }) {
  const isValid = race.statistics.some((s) => s.validFlight);
  const durationSeconds = Math.round((race.endedAt - race.startedAt) / 1000);

  return (
    <tr
      onClick={onClick}
      className="border-t border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
    >
      <td className="py-3 px-4 text-white font-medium text-sm">{race.name}</td>
      <td className="py-3 px-4 text-white/80 font-mono text-sm">{formatDate(race.startedAt)}</td>
      <td className="py-3 px-4 text-white/80 font-mono text-sm">
        {formatDuration(durationSeconds)}
      </td>
      <td className="py-3 px-4 text-white/80 font-mono text-sm">{race.pigeons.length}</td>
      <td className="py-3 px-4">
        {isValid ? (
          <Check className="w-5 h-5 text-green-600" aria-hidden="true" />
        ) : (
          <X className="w-5 h-5 text-red-500" aria-hidden="true" />
        )}
      </td>
    </tr>
  );
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

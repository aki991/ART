"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trophy, ArrowRight, Check, X } from "lucide-react";
import type { RaceListItem } from "@/lib/types/race";

interface RecentRacesTableProps {
  races: RaceListItem[];
}

export function RecentRacesTable({ races }: RecentRacesTableProps) {
  const router = useRouter();

  return (
    <div className="card-redesign p-4 xl:p-5 2xl:p-6">
      <div className="flex items-center justify-between mb-3 xl:mb-3.5 2xl:mb-4 gap-2">
        <h2 className="text-base xl:text-base 2xl:text-lg font-semibold text-text-secondary flex items-center gap-2 min-w-0">
          <Trophy className="w-5 h-5 text-accent flex-shrink-0" aria-hidden="true" />
          <span className="truncate">Poslednje trke</span>
        </h2>
        <Link
          href="/races"
          className="text-sm xl:text-sm 2xl:text-sm text-accent hover:text-accent-hover flex items-center gap-1 transition-colors whitespace-nowrap flex-shrink-0"
        >
          Vidi sve
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>

      {races.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-text-disabled mx-auto mb-4" aria-hidden="true" />
          <p className="text-text-tertiary mb-1">Još nema trka.</p>
          <Link href="/scanning" className="text-sm text-accent hover:underline">
            Pokreni prvu trku →
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg-hover text-xs uppercase text-text-tertiary font-medium">
                <tr>
                  <th className="text-left py-3 px-4 whitespace-nowrap">Vrsta takmičenja</th>
                  <th className="text-left py-3 px-4 whitespace-nowrap">Datum</th>
                  <th className="text-left py-3 px-4 whitespace-nowrap">Trajanje</th>
                  <th className="text-left py-3 px-4 whitespace-nowrap">Golubova</th>
                  <th className="text-left py-3 px-4 whitespace-nowrap">Validna</th>
                </tr>
              </thead>
              <tbody>
                {races.map((race) => (
                  <tr
                    key={race.id}
                    onClick={() => router.push(`/races/${race.id}`)}
                    className="border-t border-border hover:bg-bg-hover cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 text-text-primary font-medium text-sm whitespace-nowrap">
                      {race.name}
                    </td>
                    <td className="py-3 px-4 text-text-secondary text-sm whitespace-nowrap">
                      {formatDate(race.started_at)}
                    </td>
                    <td className="py-3 px-4 text-text-secondary text-sm whitespace-nowrap">
                      {race.duration_seconds != null
                        ? formatDuration(race.duration_seconds)
                        : "—"}
                    </td>
                    <td className="py-3 px-4 text-text-secondary text-sm whitespace-nowrap">
                      {race.pigeon_count}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {race.is_valid ? (
                        <Check className="w-5 h-5 text-status-success" aria-hidden="true" />
                      ) : (
                        <X className="w-5 h-5 text-status-error" aria-hidden="true" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("sr-RS", {
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

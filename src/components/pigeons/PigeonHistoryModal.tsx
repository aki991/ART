"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { X, Check, Trophy } from "lucide-react";
import { useRacesStore } from "@/lib/store/races-store";
import { formatIdentifier } from "@/lib/store/pigeons-store";
import type { Pigeon } from "@/lib/store/pigeons-store";

interface PigeonHistoryModalProps {
  pigeon: Pigeon;
  isOpen: boolean;
  onClose: () => void;
}

interface PigeonRaceEntry {
  raceId: string;
  raceName: string;
  startedAt: number;
  durationSeconds: number;
  timeAbove800Seconds: number;
  maxAltitude: number;
  validFlight: boolean;
}

export function PigeonHistoryModal({ pigeon, isOpen, onClose }: PigeonHistoryModalProps) {
  const router = useRouter();
  const races = useRacesStore((s) => s.races);
  const identifier = formatIdentifier(pigeon);

  const pigeonRaces: PigeonRaceEntry[] = useMemo(() => {
    const entries: PigeonRaceEntry[] = [];

    for (const race of races) {
      const racePigeon = race.pigeons.find((rp) => rp.name === identifier);
      if (!racePigeon) continue;

      const stat = race.statistics.find((s) => s.pigeonId === racePigeon.id);
      if (!stat) continue;

      entries.push({
        raceId: race.id,
        raceName: race.name,
        startedAt: race.startedAt,
        durationSeconds: stat.totalDurationSeconds,
        timeAbove800Seconds: stat.timeAbove800Seconds,
        maxAltitude: stat.maxAltitude,
        validFlight: stat.validFlight,
      });
    }

    return entries.sort((a, b) => b.startedAt - a.startedAt);
  }, [races, identifier]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl border border-cyan-brand/15 max-w-5xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-8 py-5 border-b border-cyan-brand/10">
          <div>
            <div className="text-2xl font-bold font-mono text-cyan-brand mb-1">
              {identifier}
            </div>
            <div className="text-base text-gray-500">
              {pigeon.pigeonColor || "—"}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zatvori"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Istorija trka</h3>
            <p className="text-sm text-gray-500">
              {pigeonRaces.length === 0
                ? "Golub još nije učestvovao ni u jednoj trci."
                : `Učestvovao u ${pigeonRaces.length} ${pigeonRaces.length === 1 ? "trci" : "trka"}.`}
            </p>
          </div>

          {pigeonRaces.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
              <p className="text-gray-500">
                Programiraj prsten ovom golubu i pokreni trku.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-medium">
                  <tr>
                    <th className="text-left py-3 px-4">Datum</th>
                    <th className="text-left py-3 px-4">Naziv trke</th>
                    <th className="text-left py-3 px-4">Trajanje leta</th>
                    <th className="text-left py-3 px-4">Vreme iznad 800m</th>
                    <th className="text-left py-3 px-4">Max visina</th>
                    <th className="text-left py-3 px-4">Validan let</th>
                  </tr>
                </thead>
                <tbody>
                  {pigeonRaces.map((entry) => (
                    <tr
                      key={entry.raceId}
                      onClick={() => {
                        onClose();
                        router.push(`/races/${entry.raceId}`);
                      }}
                      className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-4 text-gray-700 text-sm">
                        {formatDate(entry.startedAt)}
                      </td>
                      <td className="py-4 px-4 text-gray-900 font-medium">
                        {entry.raceName}
                      </td>
                      <td className="py-4 px-4 text-gray-700 font-mono">
                        {formatDuration(entry.durationSeconds)}
                      </td>
                      <td className="py-4 px-4 text-gray-700 font-mono">
                        {formatDuration(entry.timeAbove800Seconds)}
                      </td>
                      <td className="py-4 px-4 text-cyan-brand font-semibold">
                        {entry.maxAltitude}m
                      </td>
                      <td className="py-4 px-4">
                        {entry.validFlight ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <Check className="w-5 h-5" aria-hidden="true" />
                            <span className="text-sm font-medium">Validan</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-500">
                            <X className="w-5 h-5" aria-hidden="true" />
                            <span className="text-sm font-medium">Nije validan</span>
                          </div>
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
    </div>
  );
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.round(totalSeconds % 60);

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds}s`;
}

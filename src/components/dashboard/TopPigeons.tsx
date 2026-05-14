"use client";

import { useState, useMemo } from "react";
import { Award } from "lucide-react";
import { usePigeonsStore, formatIdentifier, type Pigeon } from "@/lib/store/pigeons-store";
import { useRacesStore } from "@/lib/store/races-store";
import { PigeonHistoryModal } from "@/components/pigeons/PigeonHistoryModal";

interface PigeonRanking {
  pigeon: Pigeon;
  identifier: string;
  raceCount: number;
  validCount: number;
  maxAltitude: number;
  validPercentage: number;
}

const RANK_COLORS = ["#FBBF24", "#9CA3AF", "#B45309"];

export function TopPigeons() {
  const pigeons = usePigeonsStore((s) => s.pigeons);
  const races = useRacesStore((s) => s.races);
  const [selectedPigeon, setSelectedPigeon] = useState<Pigeon | null>(null);

  const rankings = useMemo((): PigeonRanking[] => {
    const result: PigeonRanking[] = [];

    for (const pigeon of pigeons) {
      const identifier = formatIdentifier(pigeon);
      let raceCount = 0;
      let validCount = 0;
      let maxAltitude = 0;

      for (const race of races) {
        const racePigeon = race.pigeons.find((rp) => rp.name === identifier);
        if (!racePigeon) continue;

        const stat = race.statistics.find((s) => s.pigeonId === racePigeon.id);
        if (!stat) continue;

        raceCount++;
        if (stat.validFlight) validCount++;
        if (stat.maxAltitude > maxAltitude) maxAltitude = stat.maxAltitude;
      }

      if (raceCount > 0) {
        result.push({
          pigeon,
          identifier,
          raceCount,
          validCount,
          maxAltitude,
          validPercentage: (validCount / raceCount) * 100,
        });
      }
    }

    return result
      .sort((a, b) =>
        b.maxAltitude !== a.maxAltitude
          ? b.maxAltitude - a.maxAltitude
          : b.validPercentage - a.validPercentage
      )
      .slice(0, 3);
  }, [pigeons, races]);

  return (
    <>
      <div className="card-redesign p-6">
        <h2 className="text-lg font-semibold text-white/80 flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-cyan-brand" aria-hidden="true" />
          Top golubovi
        </h2>

        {rankings.length === 0 ? (
          <div className="text-center py-8">
            <Award className="w-12 h-12 text-white/20 mx-auto mb-3" aria-hidden="true" />
            <p className="text-sm text-white/60">
              Pokreni trku da rangiraš golubove.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rankings.map((ranking, index) => (
              <PigeonRankCard
                key={ranking.pigeon.id}
                ranking={ranking}
                rank={index + 1}
                onClick={() => setSelectedPigeon(ranking.pigeon)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedPigeon && (
        <PigeonHistoryModal
          pigeon={selectedPigeon}
          isOpen={true}
          onClose={() => setSelectedPigeon(null)}
        />
      )}
    </>
  );
}

function PigeonRankCard({
  ranking,
  rank,
  onClick,
}: {
  ranking: PigeonRanking;
  rank: number;
  onClick: () => void;
}) {
  const rankColor = RANK_COLORS[rank - 1] ?? "#6B7280";

  return (
    <div
      onClick={onClick}
      className="bg-white/5 hover:bg-white/10 rounded-lg p-4 cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ backgroundColor: rankColor }}
        >
          {rank}
        </div>
        <div className="flex items-baseline gap-2 min-w-0 flex-1">
          <span className="font-mono font-bold text-cyan-brand truncate text-sm">
            {ranking.identifier}
          </span>
          <span className="text-xs text-white/60 flex-shrink-0">
            {ranking.pigeon.pigeonColor}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <div className="text-white/40 uppercase tracking-wide text-[10px]">Trka</div>
          <div className="font-mono font-semibold text-white/80 text-sm">{ranking.raceCount}</div>
        </div>
        <div>
          <div className="text-white/40 uppercase tracking-wide text-[10px]">Validnih</div>
          <div className="font-mono font-semibold text-white/80 text-sm">
            {Math.round(ranking.validPercentage)}%
          </div>
        </div>
        <div>
          <div className="text-white/40 uppercase tracking-wide text-[10px]">Max</div>
          <div className="font-mono font-semibold text-white/80 text-sm">{ranking.maxAltitude}m</div>
        </div>
      </div>
    </div>
  );
}

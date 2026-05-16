"use client";

import { Award } from "lucide-react";
import type { TopPigeonAggregation } from "@/lib/types/race";

interface TopPigeonsProps {
  pigeons: TopPigeonAggregation[];
}

const RANK_COLORS = ["#FBBF24", "#9CA3AF", "#B45309"];

export function TopPigeons({ pigeons }: TopPigeonsProps) {
  return (
    <div className="card-redesign p-6">
      <h2 className="text-lg font-semibold text-text-secondary flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-accent" aria-hidden="true" />
        Top golubovi
      </h2>

      {pigeons.length === 0 ? (
        <div className="text-center py-8">
          <Award className="w-12 h-12 text-text-disabled mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm text-text-tertiary">
            Pokreni i završi trku da bi se pojavili rangirani golubovi.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pigeons.map((p, index) => (
            <PigeonRankCard key={p.pigeon_id} pigeon={p} rank={index + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function PigeonRankCard({
  pigeon,
  rank,
}: {
  pigeon: TopPigeonAggregation;
  rank: number;
}) {
  const rankColor = RANK_COLORS[rank - 1] ?? "#6B7280";
  const validPct =
    pigeon.race_count > 0
      ? Math.round((pigeon.valid_count / pigeon.race_count) * 100)
      : 0;

  return (
    <div className="bg-bg-hover hover:bg-bg-active rounded-lg p-4 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ backgroundColor: rankColor }}
        >
          {rank}
        </div>
        <div className="flex items-baseline gap-2 min-w-0 flex-1">
          <span className="font-mono font-bold text-accent truncate text-sm">
            {pigeon.full_ring_number}
          </span>
          <span className="text-xs text-text-tertiary flex-shrink-0">
            {pigeon.color}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <div className="text-text-tertiary uppercase tracking-wide text-[10px]">Trka</div>
          <div className="font-mono font-semibold text-text-secondary text-sm">{pigeon.race_count}</div>
        </div>
        <div>
          <div className="text-text-tertiary uppercase tracking-wide text-[10px]">Validnih</div>
          <div className="font-mono font-semibold text-text-secondary text-sm">{validPct}%</div>
        </div>
        <div>
          <div className="text-text-tertiary uppercase tracking-wide text-[10px]">Max</div>
          <div className="font-mono font-semibold text-text-secondary text-sm">{pigeon.max_altitude}m</div>
        </div>
      </div>
    </div>
  );
}

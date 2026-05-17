"use client";

import { useState } from "react";
import { Award, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getPigeonById } from "@/app/actions/pigeons";
import { PigeonHistoryModal } from "@/components/pigeons/PigeonHistoryModal";
import type { TopPigeonAggregation } from "@/lib/types/race";
import type { Pigeon } from "@/lib/types/pigeon";

interface TopPigeonsProps {
  pigeons: TopPigeonAggregation[];
}

const RANK_COLORS = ["#FBBF24", "#9CA3AF", "#B45309"];

export function TopPigeons({ pigeons }: TopPigeonsProps) {
  const [openPigeon, setOpenPigeon] = useState<Pigeon | null>(null);
  const [loadingPigeonId, setLoadingPigeonId] = useState<string | null>(null);

  async function handlePigeonClick(pigeonId: string) {
    if (loadingPigeonId) return;
    setLoadingPigeonId(pigeonId);
    const res = await getPigeonById(pigeonId);
    setLoadingPigeonId(null);
    if (!res.success) {
      toast.error("Greška", { description: res.error });
      return;
    }
    if (!res.data) {
      toast.error("Golub nije pronađen");
      return;
    }
    setOpenPigeon(res.data);
  }

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
            <PigeonRankCard
              key={p.pigeon_id}
              pigeon={p}
              rank={index + 1}
              loading={loadingPigeonId === p.pigeon_id}
              onClick={() => handlePigeonClick(p.pigeon_id)}
            />
          ))}
        </div>
      )}

      <PigeonHistoryModal
        pigeon={openPigeon}
        isOpen={openPigeon !== null}
        onClose={() => setOpenPigeon(null)}
      />
    </div>
  );
}

function PigeonRankCard({
  pigeon,
  rank,
  loading,
  onClick,
}: {
  pigeon: TopPigeonAggregation;
  rank: number;
  loading: boolean;
  onClick: () => void;
}) {
  const rankColor = RANK_COLORS[rank - 1] ?? "#6B7280";
  const validPct =
    pigeon.race_count > 0
      ? Math.round((pigeon.valid_count / pigeon.race_count) * 100)
      : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-label={`Otvori izveštaj za goluba ${pigeon.full_ring_number}`}
      className="bg-bg-hover hover:bg-bg-active rounded-lg p-4 transition-colors text-left w-full disabled:opacity-60 disabled:cursor-wait focus:outline-none focus:ring-2 focus:ring-accent/40"
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ backgroundColor: rankColor }}
        >
          {rank}
        </div>
        <div className="flex items-baseline gap-2 min-w-0 flex-1">
          <span className="font-bold text-accent truncate text-sm">
            {pigeon.full_ring_number}
          </span>
          <span className="text-xs text-text-tertiary flex-shrink-0">
            {pigeon.color}
          </span>
        </div>
        {loading && (
          <Loader2 className="w-4 h-4 animate-spin text-text-tertiary flex-shrink-0" aria-hidden="true" />
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <div className="text-text-tertiary uppercase tracking-wide text-[10px]">Trka</div>
          <div className="font-semibold text-text-secondary text-sm">{pigeon.race_count}</div>
        </div>
        <div>
          <div className="text-text-tertiary uppercase tracking-wide text-[10px]">Validnih</div>
          <div className="font-semibold text-text-secondary text-sm">{validPct}%</div>
        </div>
        <div>
          <div className="text-text-tertiary uppercase tracking-wide text-[10px]">Max</div>
          <div className="font-semibold text-text-secondary text-sm">{pigeon.max_altitude}m</div>
        </div>
      </div>
    </button>
  );
}

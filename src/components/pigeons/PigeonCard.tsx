"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { usePigeonsStore } from "@/lib/store/pigeons-store";
import type { Pigeon } from "@/lib/store/pigeons-store";
import { PigeonHistoryModal } from "./PigeonHistoryModal";

interface PigeonCardProps {
  pigeon: Pigeon;
  onEdit: (pigeon: Pigeon) => void;
  onDelete: (id: string) => void;
}

export function PigeonCard({ pigeon, onEdit, onDelete }: PigeonCardProps) {
  const formatIdentifier = usePigeonsStore((s) => s.formatIdentifier);
  const [showHistory, setShowHistory] = useState(false);

  return (
    <>
      <div
        className="card-redesign card-redesign-interactive p-6 cursor-pointer"
        onClick={() => setShowHistory(true)}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="text-2xl font-bold font-mono text-white">
            {formatIdentifier(pigeon)}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 ml-3">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onEdit(pigeon); }}
              aria-label="Izmeni goluba"
              className="p-2 rounded hover:bg-white/10 text-white/40 transition-colors"
            >
              <Pencil className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(pigeon.id); }}
              aria-label="Obriši goluba"
              className="p-2 rounded hover:bg-red-500/10 hover:text-red-400 text-white/40 transition-colors"
            >
              <Trash2 className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
        <p className="text-xl text-white/60">
          {pigeon.pigeonColor || "—"}
        </p>
      </div>

      <PigeonHistoryModal
        pigeon={pigeon}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />
    </>
  );
}

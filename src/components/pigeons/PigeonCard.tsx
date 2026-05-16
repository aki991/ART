"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { Pigeon } from "@/lib/types/pigeon";

interface PigeonCardProps {
  pigeon: Pigeon;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function PigeonCard({ pigeon, onOpen, onEdit, onDelete }: PigeonCardProps) {
  return (
    <div
      className="card-redesign card-redesign-interactive p-3 xl:p-4 2xl:p-5 cursor-pointer"
      onClick={onOpen}
    >
      <div className="flex items-start justify-between mb-2 gap-2 min-w-0">
        <div className="text-base xl:text-lg 2xl:text-xl font-bold font-mono text-text-primary whitespace-nowrap min-w-0 truncate">
          {pigeon.full_ring_number}
        </div>
        <div className="flex items-center gap-0.5 xl:gap-0.5 2xl:gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            aria-label="Izmeni goluba"
            className="p-1.5 xl:p-1.5 2xl:p-2 rounded hover:bg-bg-hover text-text-disabled transition-colors"
          >
            <Pencil className="w-4 h-4 xl:w-4 xl:h-4 2xl:w-5 2xl:h-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            aria-label="Obriši goluba"
            className="p-1.5 xl:p-1.5 2xl:p-2 rounded hover:bg-bg-error-light hover:text-status-error text-text-disabled transition-colors"
          >
            <Trash2 className="w-4 h-4 xl:w-4 xl:h-4 2xl:w-5 2xl:h-5" aria-hidden="true" />
          </button>
        </div>
      </div>
      <p className="text-base xl:text-lg 2xl:text-xl text-text-tertiary truncate">{pigeon.color || "—"}</p>
      {pigeon.name && (
        <p className="text-xs xl:text-xs 2xl:text-sm text-text-secondary mt-1 truncate">{pigeon.name}</p>
      )}
    </div>
  );
}

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
      className="card-redesign card-redesign-interactive p-6 cursor-pointer"
      onClick={onOpen}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="text-2xl font-bold font-mono text-text-primary">
          {pigeon.full_ring_number}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 ml-3">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            aria-label="Izmeni goluba"
            className="p-2 rounded hover:bg-bg-hover text-text-disabled transition-colors"
          >
            <Pencil className="w-5 h-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            aria-label="Obriši goluba"
            className="p-2 rounded hover:bg-bg-error-light hover:text-status-error text-text-disabled transition-colors"
          >
            <Trash2 className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>
      <p className="text-xl text-text-tertiary">{pigeon.color || "—"}</p>
      {pigeon.name && (
        <p className="text-base text-text-secondary mt-1 truncate">{pigeon.name}</p>
      )}
    </div>
  );
}

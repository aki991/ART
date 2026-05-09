"use client";

import { Pencil, Trash2 } from "lucide-react";
import { usePigeonsStore } from "@/lib/store/pigeons-store";
import type { Pigeon } from "@/lib/store/pigeons-store";

interface PigeonCardProps {
  pigeon: Pigeon;
  onEdit: (pigeon: Pigeon) => void;
  onDelete: (id: string) => void;
}

export function PigeonCard({ pigeon, onEdit, onDelete }: PigeonCardProps) {
  const formatIdentifier = usePigeonsStore((s) => s.formatIdentifier);

  return (
    <div className="card-redesign card-redesign-interactive p-5 flex gap-4">
      <div className="flex-1 min-w-0">
        <span className="bg-cyan-brand/10 text-cyan-brand font-mono font-semibold text-sm px-3 py-1 rounded-full inline-block">
          {formatIdentifier(pigeon)}
        </span>
        <p className="mt-3 text-lg font-semibold font-rajdhani text-gradient-cyan">
          {pigeon.pigeonColor}
        </p>
        <p className="text-xs text-gray-500 mt-1">Klub {pigeon.clubNumber}</p>
      </div>
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => onEdit(pigeon)}
          aria-label="Izmeni goluba"
          className="p-2 rounded hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <Pencil className="w-4 h-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(pigeon.id)}
          aria-label="Obriši goluba"
          className="p-2 rounded hover:bg-red-50 hover:text-red-600 text-gray-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

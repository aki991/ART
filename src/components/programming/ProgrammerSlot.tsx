"use client";

import { Info } from "lucide-react";
import { useProgrammerStore } from "@/lib/store/programmer-store";

export function ProgrammerSlot() {
  const selectedRingId = useProgrammerStore((s) => s.selectedRingId);
  const selectedSlotIndex = useProgrammerStore((s) => s.selectedSlotIndex);

  return (
    <div className="card-redesign p-6 text-center">
      <p className="text-sm uppercase tracking-widest text-white/60 font-medium mb-4">
        Očitavanje prstena
      </p>

      <img
        src="/devices/ring.png"
        alt="Elektronski prsten — Aero Ring Tech"
        draggable={false}
        className="max-h-[160px] object-contain mx-auto mb-6"
        style={{
          filter:
            "drop-shadow(0 0 20px rgba(0,210,255,0.15)) drop-shadow(0 0 40px rgba(0,210,255,0.08))",
        }}
      />

      {selectedRingId ? (
        <div className="bg-cyan-brand/10 border border-cyan-brand/30 rounded-lg p-4 text-center">
          <div className="text-3xl font-mono font-bold text-cyan-brand mb-1">
            {selectedRingId}
          </div>
          <div className="text-base text-white/60">Slot {selectedSlotIndex}</div>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 text-white/60 text-base">
          <Info className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          <span>Nema selektovanog prstena</span>
        </div>
      )}
    </div>
  );
}

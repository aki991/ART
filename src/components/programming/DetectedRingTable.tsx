"use client";

import { useMemo } from "react";
import { Search, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEmulatorStore } from "@/lib/store/emulator-store";
import { useProgrammerStore } from "@/lib/store/programmer-store";

export function DetectedRingTable() {
  const emulatorSlots = useEmulatorStore((s) => s.slots);
  const ejectRing = useEmulatorStore((s) => s.ejectRing);
  const insertedSlots = useMemo(
    () => emulatorSlots.filter((slot) => slot.status === "inserted"),
    [emulatorSlots]
  );

  const selectedRingId = useProgrammerStore((s) => s.selectedRingId);
  const selectRing = useProgrammerStore((s) => s.selectRing);
  const sessionPrograms = useProgrammerStore((s) => s.sessionPrograms);

  return (
    <div className="card-redesign">
      <div className="px-6 py-4 border-b border-cyan-brand/10 flex items-center gap-2">
        <Search className="w-4 h-4 text-white/40" aria-hidden="true" />
        <h2 className="text-lg font-semibold font-rajdhani text-white">
          Detektovani prstenovi
        </h2>
        {insertedSlots.length > 0 && (
          <span className="bg-cyan-brand/10 text-cyan-brand rounded-full px-2 py-0.5 text-xs font-medium">
            {insertedSlots.length}
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-base">
          <thead>
            <tr className="table-header-gradient">
              <th className="px-6 py-3 text-left text-sm font-medium text-white/60 uppercase tracking-wider">
                ID Prstena
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-white/60 uppercase tracking-wider">
                Slot
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-white/60 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-white/60 uppercase tracking-wider">
                Akcije
              </th>
            </tr>
          </thead>
          <tbody>
            {insertedSlots.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-base text-white/60">
                  Nema detektovanog prstena. Ubaci prsten u emulator u drugom tabu.
                </td>
              </tr>
            ) : (
              insertedSlots.map((slot) => {
                const isProgrammed = sessionPrograms.some(
                  (p) => p.ringId === slot.ringId
                );
                const isSelected =
                  !isProgrammed && selectedRingId === slot.ringId;
                return (
                  <tr
                    key={slot.index}
                    onClick={() => {
                      if (isProgrammed) return;
                      selectRing(slot.ringId!, slot.index);
                    }}
                    className={cn(
                      "border-t border-white/5 transition-colors",
                      isProgrammed
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer",
                      !isProgrammed &&
                        (isSelected ? "bg-cyan-brand/10" : "hover:bg-white/5")
                    )}
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: slot.ringColor }}
                        />
                        <span className="bg-cyan-brand/10 text-cyan-brand font-mono font-semibold px-2 py-0.5 rounded text-base">
                          {slot.ringId}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-white/80">Slot {slot.index}</td>
                    <td className="px-6 py-3">
                      {isProgrammed ? (
                        <span className="text-sm bg-cyan-brand/10 text-cyan-brand border border-cyan-brand/30 px-2 py-0.5 rounded-full">
                          Programiran
                        </span>
                      ) : (
                        <span className="text-sm bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                          Ubačen
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {isSelected && (
                          <Check
                            className="w-4 h-4 text-cyan-brand"
                            aria-label="Izabran"
                          />
                        )}
                        <button
                          type="button"
                          aria-label={`Izbaci prsten ${slot.ringId ?? ""} iz slota ${slot.index}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            ejectRing(slot.index);
                          }}
                          className="text-white/40 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {insertedSlots.length > 0 && (
        <p className="text-sm text-white/60 italic mt-3 px-6 pb-4">
          {selectedRingId
            ? "Popunite podatke goluba i kliknite \"Programiraj prsten\" →"
            : "Kliknite na red da izaberete prsten za programiranje."}
        </p>
      )}
    </div>
  );
}

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

  return (
    <div className="card-redesign">
      <div className="px-6 py-4 border-b border-cyan-brand/10 flex items-center gap-2">
        <Search className="w-4 h-4 text-gray-400" aria-hidden="true" />
        <h2 className="text-lg font-semibold font-rajdhani text-gray-900">
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
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                ID Prstena
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Slot
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                Akcije
              </th>
            </tr>
          </thead>
          <tbody>
            {insertedSlots.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-base text-gray-500">
                  Nema detektovanog prstena. Ubaci prsten u emulator u drugom tabu.
                </td>
              </tr>
            ) : (
              insertedSlots.map((slot) => {
                const isSelected = selectedRingId === slot.ringId;
                return (
                  <tr
                    key={slot.index}
                    onClick={() => selectRing(slot.ringId!, slot.index)}
                    className={cn(
                      "border-t border-gray-100 cursor-pointer transition-colors",
                      isSelected ? "bg-cyan-brand/10" : "hover:bg-gray-50"
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
                    <td className="px-6 py-3 text-gray-700">Slot {slot.index}</td>
                    <td className="px-6 py-3">
                      <span className="text-sm bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                        Ubačen
                      </span>
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
                          className="text-gray-400 hover:text-red-500 transition-colors"
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
        <p className="text-sm text-gray-500 italic mt-3 px-6 pb-4">
          {selectedRingId
            ? "Popunite podatke goluba i kliknite \"Programiraj prsten\" →"
            : "Kliknite na red da izaberete prsten za programiranje."}
        </p>
      )}
    </div>
  );
}

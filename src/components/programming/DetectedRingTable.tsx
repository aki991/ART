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
      <div className="px-4 xl:px-5 2xl:px-6 py-3 xl:py-3.5 2xl:py-4 border-b border-accent/10 flex items-center gap-2 max-lg:px-3 max-lg:py-2 max-lg:gap-1.5">
        <Search className="w-4 h-4 text-text-disabled max-lg:w-3.5 max-lg:h-3.5" aria-hidden="true" />
        <h2 className="text-base xl:text-base 2xl:text-lg font-semibold font-rajdhani text-text-primary max-lg:text-sm">
          Detektovani prstenovi
        </h2>
        {insertedSlots.length > 0 && (
          <span className="bg-accent-light text-accent rounded-full px-2 py-0.5 text-xs font-medium max-lg:text-[10px] max-lg:px-1.5">
            {insertedSlots.length}
          </span>
        )}
      </div>

      <div className="overflow-x-auto max-lg:overflow-x-visible">
        <table className="w-full text-base max-lg:text-xs">
          <thead>
            <tr className="table-header-gradient">
              <th className="px-4 xl:px-5 2xl:px-6 py-3 text-left text-xs xl:text-xs 2xl:text-sm font-medium text-text-tertiary uppercase tracking-wider whitespace-nowrap max-lg:px-2 max-lg:py-1.5 max-lg:text-[9px] max-lg:tracking-normal">
                ID Prstena
              </th>
              <th className="px-4 xl:px-5 2xl:px-6 py-3 text-left text-xs xl:text-xs 2xl:text-sm font-medium text-text-tertiary uppercase tracking-wider whitespace-nowrap max-lg:px-2 max-lg:py-1.5 max-lg:text-[9px] max-lg:tracking-normal">
                Slot
              </th>
              <th className="px-4 xl:px-5 2xl:px-6 py-3 text-left text-xs xl:text-xs 2xl:text-sm font-medium text-text-tertiary uppercase tracking-wider whitespace-nowrap max-lg:px-2 max-lg:py-1.5 max-lg:text-[9px] max-lg:tracking-normal">
                Status
              </th>
              <th className="px-4 xl:px-5 2xl:px-6 py-3 text-right text-xs xl:text-xs 2xl:text-sm font-medium text-text-tertiary uppercase tracking-wider whitespace-nowrap max-lg:px-2 max-lg:py-1.5 max-lg:text-[9px] max-lg:tracking-normal">
                Akcije
              </th>
            </tr>
          </thead>
          <tbody>
            {insertedSlots.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-base text-text-tertiary max-lg:px-3 max-lg:py-4 max-lg:text-xs">
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
                      "border-t border-border transition-colors",
                      isProgrammed
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer",
                      !isProgrammed &&
                        (isSelected ? "bg-accent-light" : "hover:bg-bg-hover")
                    )}
                  >
                    <td className="px-4 xl:px-5 2xl:px-6 py-3 max-lg:px-2 max-lg:py-2">
                      <div className="flex items-center gap-2 max-lg:gap-1.5">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0 max-lg:w-3 max-lg:h-3"
                          style={{ backgroundColor: slot.ringColor }}
                        />
                        <span className="bg-accent-light text-accent font-semibold px-2 py-0.5 rounded text-base whitespace-nowrap max-lg:text-[11px] max-lg:px-1.5">
                          {slot.ringId}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 xl:px-5 2xl:px-6 py-3 text-text-secondary whitespace-nowrap text-sm xl:text-sm 2xl:text-base max-lg:px-2 max-lg:py-2 max-lg:text-[11px]">Slot {slot.index}</td>
                    <td className="px-4 xl:px-5 2xl:px-6 py-3 max-lg:px-2 max-lg:py-2">
                      {isProgrammed ? (
                        <span className="text-sm bg-bg-success-light text-status-success border border-status-success/40 px-2 py-0.5 rounded-full max-lg:text-[10px] max-lg:px-1.5">
                          Programiran
                        </span>
                      ) : (
                        <span className="text-sm bg-bg-warning-light text-status-warning border border-status-warning/40 px-2 py-0.5 rounded-full max-lg:text-[10px] max-lg:px-1.5">
                          Ubačen
                        </span>
                      )}
                    </td>
                    <td className="px-4 xl:px-5 2xl:px-6 py-3 max-lg:px-2 max-lg:py-2">
                      <div className="flex items-center justify-end gap-2 max-lg:gap-1">
                        {isSelected && (
                          <Check
                            className="w-4 h-4 text-accent max-lg:w-3.5 max-lg:h-3.5"
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
                          className="text-text-disabled hover:text-status-error transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4 max-lg:w-3.5 max-lg:h-3.5" aria-hidden="true" />
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
        <p className="text-sm text-text-tertiary italic mt-3 px-6 pb-4 max-lg:text-[11px] max-lg:mt-2 max-lg:px-3 max-lg:pb-3">
          {selectedRingId
            ? "Popunite podatke goluba i kliknite \"Programiraj prsten\" →"
            : "Kliknite na red da izaberete prsten za programiranje."}
        </p>
      )}
    </div>
  );
}

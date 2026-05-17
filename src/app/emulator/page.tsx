"use client";

import { useEmulatorStore } from "@/lib/store/emulator-store";
import { useProgrammerStore } from "@/lib/store/programmer-store";
import { PIGEON_COLOR_PALETTE } from "@/lib/utils/pigeon-palette";
import { cn } from "@/lib/utils";

// Derived per-slot status. "programmed" is never stored — it is computed from
// useProgrammerStore.sessionPrograms so the emulator can never drift out of sync
// with the "Programirani prstenovi" section.
type DisplayStatus = "free" | "detected" | "programmed";

export default function EmulatorPage() {
  const slots = useEmulatorStore((s) => s.slots);
  const insertRing = useEmulatorStore((s) => s.insertRing);
  const ejectRing = useEmulatorStore((s) => s.ejectRing);
  const setSlotColor = useEmulatorStore((s) => s.setSlotColor);
  const sessionPrograms = useProgrammerStore((s) => s.sessionPrograms);

  return (
    <div className="min-h-screen bg-bg-app p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary font-rajdhani mb-2">
            Emulator bazne stanice
          </h1>
          <p className="text-text-tertiary">
            Test interfejs — ubaci prstenove i prati programiranje sa stranice{" "}
            <code className="text-accent">/programming</code> u drugom tabu.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {slots.map((slot) => {
            const isProgrammed =
              slot.status === "inserted" &&
              slot.ringId !== null &&
              sessionPrograms.some((p) => p.ringId === slot.ringId);
            const display: DisplayStatus =
              slot.status === "empty" ? "free" : isProgrammed ? "programmed" : "detected";

            return (
              <div
                key={slot.index}
                className={cn(
                  "rounded-xl p-5 border-2 transition-all",
                  display === "free" && "bg-bg-surface/40 border-dashed border-border",
                  display === "detected" && "bg-bg-surface border-status-warning/40",
                  display === "programmed" && "bg-bg-surface border-status-success/40"
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs uppercase tracking-wide text-text-tertiary font-medium">
                    Slot {slot.index}
                  </span>
                  <StatusBadge status={display} />
                </div>

                {display === "free" && (
                  <div className="space-y-3">
                    <div className="text-center text-sm text-text-disabled italic">
                      Slobodan slot — spreman za novi prsten
                    </div>
                    <div>
                      <div className="text-xs text-text-tertiary mb-2 text-center">
                        Boja prstena
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {PIGEON_COLOR_PALETTE.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setSlotColor(slot.index, color)}
                            aria-label={`Izaberi boju ${color}`}
                            className={cn(
                              "w-7 h-7 rounded-full transition-all",
                              slot.ringColor === color
                                ? "ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110"
                                : "hover:scale-105"
                            )}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => insertRing(slot.index)}
                      className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white font-medium rounded-md transition-colors text-sm"
                    >
                      Ubaci prsten
                    </button>
                  </div>
                )}

                {display === "detected" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3 min-h-[48px]">
                      <div
                        className="w-6 h-6 rounded-full ring-2 ring-border-strong flex-shrink-0"
                        style={{ backgroundColor: slot.ringColor }}
                      />
                      <span className="text-2xl font-bold text-status-warning">
                        {slot.ringId}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => ejectRing(slot.index)}
                      className="w-full py-2.5 bg-bg-input hover:bg-bg-hover border border-border text-text-secondary font-medium rounded-md transition-colors text-sm"
                    >
                      Izbaci prsten
                    </button>
                  </div>
                )}

                {display === "programmed" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3 min-h-[48px]">
                      <div
                        className="w-6 h-6 rounded-full ring-2 ring-border-strong flex-shrink-0"
                        style={{ backgroundColor: slot.ringColor }}
                      />
                      <span className="text-2xl font-bold text-status-success">
                        {slot.ringId}
                      </span>
                    </div>
                    <div className="text-center text-xs text-status-success font-medium">
                      ✓ Programiran
                    </div>
                    <button
                      type="button"
                      onClick={() => ejectRing(slot.index)}
                      className="w-full py-2.5 bg-bg-input hover:bg-bg-hover border border-border text-text-secondary font-medium rounded-md transition-colors text-sm"
                    >
                      Izbaci prsten
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-6 text-sm">
          <LegendItem color="border-border-strong border-dashed" label="Slobodan" />
          <LegendItem color="border-status-warning" label="Detektovan (nije programiran)" />
          <LegendItem color="border-status-success" label="Programiran" />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: DisplayStatus }) {
  const config: Record<DisplayStatus, { label: string; className: string }> = {
    free: { label: "Slobodan", className: "bg-bg-input text-text-tertiary" },
    detected: { label: "Detektovan", className: "bg-bg-warning-light text-status-warning" },
    programmed: { label: "✓ Programiran", className: "bg-bg-success-light text-status-success" },
  };
  const c = config[status];
  return (
    <span className={cn("text-xs px-2 py-1 rounded-full font-medium", c.className)}>
      {c.label}
    </span>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("w-4 h-4 rounded border-2", color)} />
      <span className="text-text-tertiary">{label}</span>
    </div>
  );
}

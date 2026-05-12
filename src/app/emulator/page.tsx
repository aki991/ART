"use client";

import { useEmulatorStore } from "@/lib/store/emulator-store";
import type { SlotStatus } from "@/lib/store/emulator-store";
import { PIGEON_COLOR_PALETTE } from "@/lib/utils/pigeon-palette";
import { cn } from "@/lib/utils";

export default function EmulatorPage() {
  const slots = useEmulatorStore((s) => s.slots);
  const insertRing = useEmulatorStore((s) => s.insertRing);
  const ejectRing = useEmulatorStore((s) => s.ejectRing);
  const setSlotColor = useEmulatorStore((s) => s.setSlotColor);

  return (
    <div className="min-h-screen bg-app-surface p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white font-rajdhani mb-2">
            Emulator bazne stanice
          </h1>
          <p className="text-white/60">
            Test interfejs — ubaci prstenove i prati programiranje sa stranice{" "}
            <code className="text-cyan-brand">/programming</code> u drugom tabu.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {slots.map((slot) => (
            <div
              key={slot.index}
              className={cn(
                "rounded-xl p-5 border-2 transition-all",
                slot.status === "empty" && "bg-card-dark border-white/10",
                slot.status === "inserted" && "bg-card-dark border-amber-400/50",
                slot.status === "programmed" && "bg-card-dark border-green-400/50"
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-wide text-white/50 font-medium">
                  Slot {slot.index}
                </span>
                <StatusBadge status={slot.status} />
              </div>

              {slot.status === "empty" && (
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-white/50 mb-2 text-center">Boja prstena</div>
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
                    className="w-full py-2.5 bg-cyan-brand hover:bg-cyan-dark text-white font-medium rounded-md transition-colors text-sm"
                  >
                    Ubaci prsten
                  </button>
                </div>
              )}

              {slot.status === "inserted" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-3 min-h-[48px]">
                    <div
                      className="w-6 h-6 rounded-full ring-2 ring-white/30 flex-shrink-0"
                      style={{ backgroundColor: slot.ringColor }}
                    />
                    <span className="text-2xl font-mono font-bold text-amber-400">
                      {slot.ringId}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => ejectRing(slot.index)}
                    className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-medium rounded-md transition-colors text-sm"
                  >
                    Izbaci prsten
                  </button>
                </div>
              )}

              {slot.status === "programmed" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-3 min-h-[48px]">
                    <div
                      className="w-6 h-6 rounded-full ring-2 ring-white/30 flex-shrink-0"
                      style={{ backgroundColor: slot.ringColor }}
                    />
                    <span className="text-2xl font-mono font-bold text-green-400">
                      {slot.ringId}
                    </span>
                  </div>
                  <div className="text-center text-xs text-green-400 font-medium">
                    ✓ Programiran
                  </div>
                  <button
                    type="button"
                    onClick={() => ejectRing(slot.index)}
                    className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-medium rounded-md transition-colors text-sm"
                  >
                    Izbaci prsten
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-6 text-sm">
          <LegendItem color="border-white/30" label="Prazan" />
          <LegendItem color="border-amber-400" label="Ubačen (čeka programiranje)" />
          <LegendItem color="border-green-400" label="Programiran" />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: SlotStatus }) {
  const config: Record<SlotStatus, { label: string; className: string }> = {
    empty: { label: "Prazan", className: "bg-white/5 text-white/50" },
    inserted: { label: "Ubačen", className: "bg-amber-400/15 text-amber-400" },
    programmed: { label: "✓ Programiran", className: "bg-green-400/15 text-green-400" },
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
      <span className="text-white/60">{label}</span>
    </div>
  );
}

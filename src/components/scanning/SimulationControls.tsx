"use client";

import { Pause, Play, RotateCcw, Unplug } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTelemetryStore } from "@/lib/store/telemetry-store";
import { useConnectionStore } from "@/lib/store/connection-store";

export function SimulationControls() {
  const isPaused = useTelemetryStore((s) => s.isPaused);
  const setPaused = useTelemetryStore((s) => s.setPaused);
  const resetSession = useTelemetryStore((s) => s.resetSession);
  const disconnect = useConnectionStore((s) => s.disconnect);

  function handleReset() {
    if (
      window.confirm(
        "Da li ste sigurni? Sve trenutne podatke ćete izgubiti."
      )
    ) {
      resetSession();
    }
  }

  return (
    <div className="card-redesign p-4">
      <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">
        Kontrole
      </p>
      <div className="space-y-2">
        <button
          type="button"
          aria-label={isPaused ? "Nastavi simulaciju" : "Pauziraj simulaciju"}
          onClick={() => setPaused(!isPaused)}
          className={cn(
            "w-full px-4 py-2.5 rounded-md text-sm font-medium transition-colors inline-flex items-center justify-center gap-2 border",
            isPaused
              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
              : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
          )}
        >
          {isPaused ? (
            <><Play size={14} aria-hidden="true" /> Nastavi</>
          ) : (
            <><Pause size={14} aria-hidden="true" /> Pauziraj</>
          )}
        </button>

        <button
          type="button"
          aria-label="Resetuj podatke sesije"
          onClick={handleReset}
          className="w-full px-4 py-2.5 rounded-md text-sm font-medium transition-colors inline-flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
        >
          <RotateCcw size={14} aria-hidden="true" />
          Resetuj podatke
        </button>

        <button
          type="button"
          aria-label="Diskonektuj uređaj"
          onClick={disconnect}
          className="w-full px-4 py-2.5 rounded-md text-sm font-medium transition-colors inline-flex items-center justify-center gap-2 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
        >
          <Unplug size={14} aria-hidden="true" />
          Diskonektuj
        </button>
      </div>
    </div>
  );
}

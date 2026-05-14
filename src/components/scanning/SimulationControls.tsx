"use client";

import { Play, Square, Unplug } from "lucide-react";
import { useConnectionStore } from "@/lib/store/connection-store";
import { useProgrammerStore } from "@/lib/store/programmer-store";

export function SimulationControls() {
  const raceActive = useConnectionStore((s) => s.raceActive);
  const raceName = useConnectionStore((s) => s.raceName);
  const setRaceName = useConnectionStore((s) => s.setRaceName);
  const startRace = useConnectionStore((s) => s.startRace);
  const endRace = useConnectionStore((s) => s.endRace);
  const disconnect = useConnectionStore((s) => s.disconnect);
  const sessionProgramsCount = useProgrammerStore((s) => s.sessionPrograms.length);

  const hasPigeons = sessionProgramsCount > 0;
  const hasName = raceName.trim().length > 0;
  const canStart = hasPigeons && hasName;

  return (
    <div className="card-redesign p-6">
      <p className="text-sm uppercase tracking-widest text-white/60 mb-3">
        Kontrole
      </p>
      <div className="space-y-2">
        {!raceActive ? (
          <div className="space-y-2">
            <div>
              <label
                htmlFor="race-name-input"
                className="block text-xs uppercase tracking-widest text-white/60 font-medium mb-1.5"
              >
                Naziv trke *
              </label>
              <input
                id="race-name-input"
                type="text"
                value={raceName}
                onChange={(e) => setRaceName(e.target.value)}
                maxLength={50}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder:text-white/30 focus:border-cyan-brand focus:ring-2 focus:ring-cyan-brand/20 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={startRace}
              disabled={!canStart}
              className="w-full px-4 py-3 rounded-md text-base font-medium transition-colors inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Play size={20} aria-hidden="true" />
              Start trke
            </button>

            {!canStart && (
              <p className="text-xs text-white/40 text-center">
                {!hasPigeons
                  ? "Programiraj bar 1 prsten da bi pokrenuo trku"
                  : "Unesi naziv trke da pokreneš"}
              </p>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={endRace}
            className="w-full px-4 py-3 rounded-md text-base font-medium transition-colors inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Square size={20} aria-hidden="true" />
            Prekid trke
          </button>
        )}

        <button
          type="button"
          onClick={disconnect}
          className="w-full px-4 py-3 rounded-md text-base font-medium transition-colors inline-flex items-center justify-center gap-2 bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20"
        >
          <Unplug size={20} aria-hidden="true" />
          Diskonektuj
        </button>
      </div>
    </div>
  );
}

"use client";

import { Trash2, X } from "lucide-react";
import { useProgrammerStore } from "@/lib/store/programmer-store";
import type { ProgrammedRing } from "@/lib/store/programmer-store";

export function SessionProgramsTable() {
  const sessionPrograms = useProgrammerStore((s) => s.sessionPrograms);
  const removeProgrammedRing = useProgrammerStore((s) => s.removeProgrammedRing);
  const clearSession = useProgrammerStore((s) => s.clearSession);

  function handleClearSession() {
    if (
      window.confirm(
        "Da li ste sigurni? Svi programirani prstenovi iz ove sesije će biti obrisani."
      )
    ) {
      clearSession();
    }
  }

  return (
    <div className="card-redesign">
      <div className="px-6 py-4 border-b border-cyan-brand/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold font-rajdhani text-white">
            Programirani prstenovi (sesija)
          </h2>
          <span className="bg-white/10 text-white/60 rounded-full px-2 py-0.5 text-sm">
            {sessionPrograms.length}
          </span>
        </div>
        <button
          type="button"
          disabled={sessionPrograms.length === 0}
          onClick={handleClearSession}
          aria-label="Obriši sve programirane prstenove iz sesije"
          className="text-base text-white/60 hover:text-red-400 inline-flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
          Obriši sesiju
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-base">
          <thead>
            <tr className="table-header-gradient">
              <th className="px-6 py-3 text-left text-sm font-medium text-white/60 uppercase tracking-wider">
                ID Prstena
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-white/60 uppercase tracking-wider">
                Golub
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-white/60 uppercase tracking-wider">
                Boja goluba
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-white/60 uppercase tracking-wider">
                Vreme
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-white/60 uppercase tracking-wider">
                Akcije
              </th>
            </tr>
          </thead>
          <tbody>
            {sessionPrograms.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-base text-white/60"
                >
                  Još uvek niste programirali nijedan prsten u ovoj sesiji.
                </td>
              </tr>
            ) : (
              sessionPrograms.map((ring: ProgrammedRing) => (
                <tr key={ring.id} className="table-row-alt table-row-hover border-t border-white/5">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: ring.ringColor }}
                      />
                      <span className="bg-cyan-brand/10 text-cyan-brand font-mono font-semibold px-2 py-0.5 rounded text-base">
                        {ring.ringId}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    {ring.pigeonIdentifier === "Drugi golub" ? (
                      <span className="text-white/40 italic text-base">Drugi golub</span>
                    ) : (
                      <span className="font-mono text-sm text-white/80">
                        {ring.pigeonIdentifier}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-white/80">{ring.pigeonColor}</td>
                  <td className="px-6 py-3 text-white/80">
                    {ring.programmedAt.toLocaleTimeString("sr-RS")}
                  </td>
                  <td className="px-6 py-3">
                    <button
                      type="button"
                      aria-label={`Ukloni programirani prsten ${ring.ringId}`}
                      onClick={() => removeProgrammedRing(ring.id)}
                      className="text-white/40 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

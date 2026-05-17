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
      <div className="px-4 xl:px-5 2xl:px-6 py-3 xl:py-3.5 2xl:py-4 border-b border-accent/10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-base xl:text-base 2xl:text-lg font-semibold font-rajdhani text-text-primary truncate">
            Programirani prstenovi (sesija)
          </h2>
          <span className="bg-bg-hover text-text-tertiary rounded-full px-2 py-0.5 text-xs xl:text-xs 2xl:text-sm flex-shrink-0">
            {sessionPrograms.length}
          </span>
        </div>
        <button
          type="button"
          disabled={sessionPrograms.length === 0}
          onClick={handleClearSession}
          aria-label="Obriši sve programirane prstenove iz sesije"
          className="text-sm xl:text-sm 2xl:text-base text-text-tertiary hover:text-status-error inline-flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap flex-shrink-0"
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
          Obriši sesiju
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-base">
          <thead>
            <tr className="table-header-gradient">
              <th className="px-4 xl:px-5 2xl:px-6 py-3 text-left text-xs xl:text-xs 2xl:text-sm font-medium text-text-tertiary uppercase tracking-wider whitespace-nowrap">
                ID Prstena
              </th>
              <th className="px-4 xl:px-5 2xl:px-6 py-3 text-left text-xs xl:text-xs 2xl:text-sm font-medium text-text-tertiary uppercase tracking-wider whitespace-nowrap">
                Golub
              </th>
              <th className="px-4 xl:px-5 2xl:px-6 py-3 text-left text-xs xl:text-xs 2xl:text-sm font-medium text-text-tertiary uppercase tracking-wider whitespace-nowrap">
                Boja goluba
              </th>
              <th className="px-4 xl:px-5 2xl:px-6 py-3 text-left text-xs xl:text-xs 2xl:text-sm font-medium text-text-tertiary uppercase tracking-wider whitespace-nowrap">
                Vreme
              </th>
              <th className="px-4 xl:px-5 2xl:px-6 py-3 text-left text-xs xl:text-xs 2xl:text-sm font-medium text-text-tertiary uppercase tracking-wider whitespace-nowrap">
                Akcije
              </th>
            </tr>
          </thead>
          <tbody>
            {sessionPrograms.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-base text-text-tertiary"
                >
                  Još uvek niste programirali nijedan prsten u ovoj sesiji.
                </td>
              </tr>
            ) : (
              sessionPrograms.map((ring: ProgrammedRing) => (
                <tr key={ring.id} className="table-row-alt table-row-hover border-t border-border">
                  <td className="px-4 xl:px-5 2xl:px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: ring.ringColor }}
                      />
                      <span className="bg-accent-light text-accent font-semibold px-2 py-0.5 rounded text-base whitespace-nowrap">
                        {ring.ringId}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 xl:px-5 2xl:px-6 py-3">
                    {ring.pigeonIdentifier === "Drugi golub" ? (
                      <span className="text-text-disabled italic text-base">Drugi golub</span>
                    ) : (
                      <span className="text-sm text-text-secondary whitespace-nowrap">
                        {ring.pigeonIdentifier}
                      </span>
                    )}
                  </td>
                  <td className="px-4 xl:px-5 2xl:px-6 py-3 text-text-secondary text-sm xl:text-sm 2xl:text-base">{ring.pigeonColor}</td>
                  <td className="px-4 xl:px-5 2xl:px-6 py-3 text-text-secondary text-sm xl:text-sm 2xl:text-base">
                    {ring.programmedAt.toLocaleTimeString("sr-RS")}
                  </td>
                  <td className="px-4 xl:px-5 2xl:px-6 py-3">
                    <button
                      type="button"
                      aria-label={`Ukloni programirani prsten ${ring.ringId}`}
                      onClick={() => removeProgrammedRing(ring.id)}
                      className="text-text-disabled hover:text-status-error transition-colors"
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

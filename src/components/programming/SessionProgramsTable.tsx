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
          <h2 className="text-base font-semibold font-rajdhani text-gray-900">
            Programirani prstenovi (sesija)
          </h2>
          <span className="bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs">
            {sessionPrograms.length}
          </span>
        </div>
        <button
          type="button"
          disabled={sessionPrograms.length === 0}
          onClick={handleClearSession}
          aria-label="Obriši sve programirane prstenove iz sesije"
          className="text-sm text-gray-600 hover:text-red-600 inline-flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-3 h-3" aria-hidden="true" />
          Obriši sesiju
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header-gradient">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID Prstena
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Golub
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Boja goluba
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vreme
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Akcije
              </th>
            </tr>
          </thead>
          <tbody>
            {sessionPrograms.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-sm text-gray-500"
                >
                  Još uvek niste programirali nijedan prsten u ovoj sesiji.
                </td>
              </tr>
            ) : (
              sessionPrograms.map((ring: ProgrammedRing) => (
                <tr key={ring.id} className="table-row-alt table-row-hover border-t border-gray-100">
                  <td className="px-6 py-3">
                    <span className="bg-cyan-brand/10 text-cyan-brand font-mono font-semibold px-2 py-0.5 rounded text-sm">
                      {ring.ringId}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    {ring.pigeonIdentifier === "Drugi golub" ? (
                      <span className="text-gray-400 italic text-sm">Drugi golub</span>
                    ) : (
                      <span className="font-mono text-xs text-gray-700">
                        {ring.pigeonIdentifier}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-gray-700">{ring.pigeonColor}</td>
                  <td className="px-6 py-3 text-gray-700">
                    {ring.programmedAt.toLocaleTimeString("sr-RS")}
                  </td>
                  <td className="px-6 py-3">
                    <button
                      type="button"
                      aria-label={`Ukloni programirani prsten ${ring.ringId}`}
                      onClick={() => removeProgrammedRing(ring.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
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

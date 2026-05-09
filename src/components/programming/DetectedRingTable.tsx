"use client";

import { Search, X } from "lucide-react";
import { useProgrammerStore } from "@/lib/store/programmer-store";

export function DetectedRingTable() {
  const currentScannedRing = useProgrammerStore((s) => s.currentScannedRing);
  const scannedAt = useProgrammerStore((s) => s.scannedAt);
  const clearScannedRing = useProgrammerStore((s) => s.clearScannedRing);

  return (
    <div className="card-redesign">
      <div className="px-6 py-4 border-b border-cyan-brand/10 flex items-center gap-2">
        <Search className="w-4 h-4 text-gray-400" aria-hidden="true" />
        <h2 className="text-base font-semibold font-rajdhani text-gray-900">
          Detektovani prsten
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header-gradient">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID Prstena
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slot
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
            {!currentScannedRing ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  Nema očitanog prstena. Kliknite &quot;Očitaj prsten&quot;.
                </td>
              </tr>
            ) : (
              <tr className="table-row-hover border-t border-gray-100">
                <td className="px-6 py-3">
                  <span className="bg-cyan-brand/10 text-cyan-brand font-mono font-semibold px-2 py-0.5 rounded text-sm">
                    {currentScannedRing}
                  </span>
                </td>
                <td className="px-6 py-3 text-gray-700">Slot 1</td>
                <td className="px-6 py-3 text-gray-700">
                  {scannedAt?.toLocaleTimeString("sr-RS") ?? "—"}
                </td>
                <td className="px-6 py-3">
                  <button
                    type="button"
                    aria-label="Ukloni detektovani prsten"
                    onClick={clearScannedRing}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {currentScannedRing && (
        <p className="text-xs text-gray-500 italic mt-3 px-6 pb-4">
          Popunite podatke goluba i kliknite &quot;Programiraj prsten&quot; →
        </p>
      )}
    </div>
  );
}

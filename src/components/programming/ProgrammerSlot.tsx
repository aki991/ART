"use client";

import { Search, Loader2 } from "lucide-react";
import { useProgrammerStore } from "@/lib/store/programmer-store";

export function ProgrammerSlot() {
  const isScanning = useProgrammerStore((s) => s.isScanning);
  const isProgramming = useProgrammerStore((s) => s.isProgramming);
  const currentScannedRing = useProgrammerStore((s) => s.currentScannedRing);
  const scanRing = useProgrammerStore((s) => s.scanRing);

  const buttonDisabled = isScanning || isProgramming;

  return (
    <div className="card-redesign p-6 text-center">
      <p className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-4">
        Očitavanje prstena
      </p>

      <img
        src="/devices/ring.png"
        alt="Elektronski prsten — Aero Ring Tech"
        draggable={false}
        className="max-h-[160px] object-contain mx-auto mb-4"
        style={{
          filter:
            "drop-shadow(0 0 20px rgba(0,210,255,0.15)) drop-shadow(0 0 40px rgba(0,210,255,0.08))",
        }}
      />

      <div className="min-h-[64px] flex items-center justify-center">
        {isScanning ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-cyan-brand animate-spin" aria-hidden="true" />
            <span className="text-sm text-gray-600">Skeniranje...</span>
          </div>
        ) : currentScannedRing ? (
          <div className="bg-cyan-brand/10 border-2 border-cyan-brand rounded-lg px-6 py-3">
            <p className="text-xs uppercase text-gray-500 mb-1">Detektovani ID</p>
            <p className="text-2xl font-mono font-bold text-cyan-brand">
              {currentScannedRing}
            </p>
          </div>
        ) : (
          <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg px-6 py-3">
            <span className="text-sm text-gray-400">Nema prstena</span>
          </div>
        )}
      </div>

      <button
        type="button"
        disabled={buttonDisabled}
        onClick={() => void scanRing()}
        aria-label={isScanning ? "Skeniranje u toku" : "Očitaj prsten"}
        className="btn-shine-redesign w-full mt-6 px-4 py-3 rounded-md inline-flex items-center justify-center gap-2 font-medium text-sm transition-colors bg-cyan-brand hover:bg-cyan-dark text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isScanning ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            Skeniranje...
          </>
        ) : (
          <>
            <Search className="w-4 h-4" aria-hidden="true" />
            {currentScannedRing ? "Očitaj ponovo" : "Očitaj prsten"}
          </>
        )}
      </button>
    </div>
  );
}

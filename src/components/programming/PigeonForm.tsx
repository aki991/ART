"use client";

import { useEffect, useState } from "react";
import { Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import { useProgrammerStore } from "@/lib/store/programmer-store";
import { usePigeonsStore } from "@/lib/store/pigeons-store";

export function PigeonForm() {
  const [selectedPigeonId, setSelectedPigeonId] = useState("");
  const [pigeonColor, setPigeonColor] = useState("");
  const [federationBandNumber, setFederationBandNumber] = useState("");

  const currentScannedRing = useProgrammerStore((s) => s.currentScannedRing);
  const isScanning = useProgrammerStore((s) => s.isScanning);
  const isProgramming = useProgrammerStore((s) => s.isProgramming);
  const programRing = useProgrammerStore((s) => s.programRing);

  const pigeons = usePigeonsStore((s) => s.pigeons);
  const formatIdentifier = usePigeonsStore((s) => s.formatIdentifier);
  const getPigeonById = usePigeonsStore((s) => s.getPigeonById);

  useEffect(() => {
    setPigeonColor("");
    setFederationBandNumber("");
  }, [selectedPigeonId]);

  const showManualFields = selectedPigeonId === "" || selectedPigeonId === "manual";
  const isUuid = selectedPigeonId !== "" && selectedPigeonId !== "manual";

  const isDisabled =
    !currentScannedRing ||
    isProgramming ||
    isScanning ||
    selectedPigeonId === "" ||
    (selectedPigeonId === "manual" && (!pigeonColor.trim() || !federationBandNumber.trim())) ||
    (isUuid && !getPigeonById(selectedPigeonId));

  async function handleSubmit() {
    let pigeonIdentifier: string;
    let finalPigeonColor: string;

    if (selectedPigeonId === "manual") {
      pigeonIdentifier = "Drugi golub";
      finalPigeonColor = pigeonColor.trim();
    } else {
      const pigeon = getPigeonById(selectedPigeonId);
      if (!pigeon) {
        toast.error("Izabrani golub više ne postoji");
        return;
      }
      pigeonIdentifier = formatIdentifier(pigeon);
      finalPigeonColor = pigeon.pigeonColor;
    }

    const ringId = currentScannedRing;
    const result = await programRing({ pigeonIdentifier, pigeonColor: finalPigeonColor });

    if (result.success) {
      toast.success("Prsten programiran", {
        description: `Ring ID ${ringId ?? ""} je uspešno povezan sa golubom.`,
      });
      setSelectedPigeonId("");
      setPigeonColor("");
      setFederationBandNumber("");
    } else {
      toast.error("Programiranje neuspešno", {
        description: result.error,
      });
    }
  }

  const inputClass =
    "w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:border-cyan-brand focus:ring-2 focus:ring-cyan-brand/20 focus:outline-none";

  return (
    <div className="card-redesign p-6">
      <p className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-4">
        Podaci goluba
      </p>

      {/* Dropdown za izbor goluba */}
      <div className="mb-4">
        <label
          htmlFor="pigeon-select"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Golub <span className="text-red-500">*</span>
        </label>
        <select
          id="pigeon-select"
          value={selectedPigeonId}
          onChange={(e) => setSelectedPigeonId(e.target.value)}
          className={inputClass}
        >
          <option value="">Izaberi goluba...</option>
          {pigeons.map((p) => (
            <option key={p.id} value={p.id}>
              {formatIdentifier(p)} — {p.pigeonColor}
            </option>
          ))}
          <option value="manual">Drugi golub (slobodan unos)</option>
        </select>
        {pigeons.length === 0 && (
          <p className="text-xs text-amber-600 mt-1.5">
            Nema dodanih golubova. Dodaj golubove na stranici &apos;Golubovi&apos; ili izaberi
            &apos;Drugi golub&apos; za jednokratan unos.
          </p>
        )}
        {isUuid && (
          <p className="text-xs text-gray-500 mt-1.5">
            Boja goluba i broj savezne alke se automatski preuzimaju iz odabranog goluba.
          </p>
        )}
      </div>

      {/* Boja goluba i Broj savezne alke — vidljivi samo za manual unos */}
      {showManualFields && (
        <>
          <div className="mb-4">
            <label
              htmlFor="pigeon-color"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Boja goluba <span className="text-red-500">*</span>
            </label>
            <input
              id="pigeon-color"
              type="text"
              value={pigeonColor}
              onChange={(e) => setPigeonColor(e.target.value)}
              placeholder="npr. Sivi, Beli, Šaren..."
              className={inputClass}
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="federation-band-number"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Broj savezne alke <span className="text-red-500">*</span>
            </label>
            <input
              id="federation-band-number"
              type="text"
              value={federationBandNumber}
              onChange={(e) => setFederationBandNumber(e.target.value)}
              placeholder="npr. 12-12345-67-26"
              maxLength={30}
              className={inputClass}
            />
          </div>
        </>
      )}

      <button
        type="button"
        disabled={isDisabled}
        onClick={() => void handleSubmit()}
        aria-label="Programiraj prsten sa unetim podacima"
        className="btn-shine-redesign w-full px-4 py-3 rounded-md inline-flex items-center justify-center gap-2 font-medium text-sm transition-colors bg-cyan-brand hover:bg-cyan-dark text-white disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
      >
        {isProgramming ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            Programiranje...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" aria-hidden="true" />
            Programiraj prsten
          </>
        )}
      </button>
    </div>
  );
}

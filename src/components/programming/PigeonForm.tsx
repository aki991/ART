"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import { useProgrammerStore } from "@/lib/store/programmer-store";
import { usePigeonsStore } from "@/lib/store/pigeons-store";
import { useEmulatorStore } from "@/lib/store/emulator-store";

export function PigeonForm() {
  const [selectedPigeonId, setSelectedPigeonId] = useState("");
  const [pigeonColor, setPigeonColor] = useState("");
  const [federationBandNumber, setFederationBandNumber] = useState("");

  const isProgramming = useProgrammerStore((s) => s.isProgramming);
  const programRing = useProgrammerStore((s) => s.programRing);
  const selectedRingId = useProgrammerStore((s) => s.selectedRingId);
  const clearSelectedRing = useProgrammerStore((s) => s.clearSelectedRing);

  const pigeons = usePigeonsStore((s) => s.pigeons);
  const formatIdentifier = usePigeonsStore((s) => s.formatIdentifier);
  const getPigeonById = usePigeonsStore((s) => s.getPigeonById);
  const sessionPrograms = useProgrammerStore((s) => s.sessionPrograms);

  const programmedIdentifiers = useMemo(
    () => new Set(sessionPrograms.map((p) => p.pigeonIdentifier)),
    [sessionPrograms]
  );

  const availablePigeons = useMemo(
    () => pigeons.filter((p) => !programmedIdentifiers.has(formatIdentifier(p))),
    [pigeons, programmedIdentifiers, formatIdentifier]
  );

  const emulatorSlots = useEmulatorStore((s) => s.slots);
  const markProgrammed = useEmulatorStore((s) => s.markProgrammed);
  const insertedSlots = useMemo(
    () => emulatorSlots.filter((s) => s.status === "inserted"),
    [emulatorSlots]
  );

  // Clear selection if the selected slot was ejected from the emulator
  useEffect(() => {
    if (!selectedRingId) return;
    const stillPresent = insertedSlots.some((s) => s.ringId === selectedRingId);
    if (!stillPresent) clearSelectedRing();
  }, [insertedSlots, selectedRingId, clearSelectedRing]);

  useEffect(() => {
    setPigeonColor("");
    setFederationBandNumber("");
  }, [selectedPigeonId]);

  const showManualFields = selectedPigeonId === "";
  const isUuid = selectedPigeonId !== "";

  const isDisabled =
    !selectedRingId ||
    isProgramming ||
    (selectedPigeonId === "" && (!pigeonColor.trim() || !federationBandNumber.trim())) ||
    (isUuid && !getPigeonById(selectedPigeonId));

  async function handleSubmit() {
    if (!selectedRingId) {
      toast.error("Izaberi prsten klikom na red u tabeli detektovanih prstenova");
      return;
    }

    let pigeonIdentifier: string;
    let finalPigeonColor: string;

    if (selectedPigeonId === "") {
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

    const result = await programRing({
      ringId: selectedRingId,
      pigeonIdentifier,
      pigeonColor: finalPigeonColor,
    });

    if (result.success) {
      markProgrammed(selectedRingId);
      toast.success("Prsten programiran", {
        description: `Ring ID ${selectedRingId} je uspešno povezan sa golubom.`,
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
    "w-full px-3 py-2.5 border border-gray-300 rounded-md text-lg focus:border-cyan-brand focus:ring-2 focus:ring-cyan-brand/20 focus:outline-none";

  return (
    <div className="card-redesign p-6">
      <p className="text-sm uppercase tracking-widest text-gray-500 font-medium mb-4">
        Podaci goluba
      </p>

      <div className="mb-4">
        <label
          htmlFor="pigeon-select"
          className="block text-base font-medium text-gray-700 mb-1.5"
        >
          Golub
        </label>
        <select
          id="pigeon-select"
          value={selectedPigeonId}
          onChange={(e) => setSelectedPigeonId(e.target.value)}
          className={inputClass}
        >
          <option value="">Izaberi goluba...</option>
          {availablePigeons.map((p) => (
            <option key={p.id} value={p.id}>
              {formatIdentifier(p)} — {p.pigeonColor}
            </option>
          ))}
        </select>
        {pigeons.length === 0 ? (
          <p className="text-sm text-gray-500 mt-1.5">
            Nema dodatih golubova. Možeš popuniti polja ručno ili dodati goluba na stranici
            &apos;Golubovi&apos;.
          </p>
        ) : availablePigeons.length === 0 ? (
          <p className="text-sm text-gray-500 mt-1.5">
            Svi golubovi su već programirani u ovoj sesiji.
          </p>
        ) : isUuid ? (
          <p className="text-sm text-gray-500 mt-1.5">
            Boja goluba i broj savezne alke se automatski preuzimaju iz odabranog goluba.
          </p>
        ) : (
          <p className="text-sm text-gray-500 mt-1.5">
            Ako golub nije u listi, popuni boju i broj alke ručno.
          </p>
        )}
      </div>

      {showManualFields && (
        <>
          <div className="mb-4">
            <label
              htmlFor="pigeon-color"
              className="block text-base font-medium text-gray-700 mb-1.5"
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
              className="block text-base font-medium text-gray-700 mb-1.5"
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
        className="btn-shine-redesign w-full px-4 py-3 rounded-md inline-flex items-center justify-center gap-2 font-medium text-base transition-colors bg-cyan-brand hover:bg-cyan-dark text-white disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
      >
        {isProgramming ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            Programiranje...
          </>
        ) : (
          <>
            <Zap className="w-5 h-5" aria-hidden="true" />
            Programiraj prsten
          </>
        )}
      </button>
    </div>
  );
}

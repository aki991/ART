"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { usePigeonsStore } from "@/lib/store/pigeons-store";
import type { Pigeon, PigeonInput } from "@/lib/store/pigeons-store";

interface PigeonModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPigeon?: Pigeon | null;
}

export function PigeonModal({ isOpen, onClose, editingPigeon }: PigeonModalProps) {
  const [mounted, setMounted] = useState(false);
  const [pigeonColor, setPigeonColor] = useState("");
  const [clubName, setClubName] = useState("");
  const [clubNumber, setClubNumber] = useState("");
  const [breederNumber, setBreederNumber] = useState("");
  const [pigeonNumber, setPigeonNumber] = useState("");
  const [year, setYear] = useState("");

  const colorInputRef = useRef<HTMLInputElement>(null);
  const addPigeon = usePigeonsStore((s) => s.addPigeon);
  const updatePigeon = usePigeonsStore((s) => s.updatePigeon);

  useEffect(() => {
    if (!isOpen) {
      setMounted(false);
      return;
    }
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (editingPigeon) {
      setPigeonColor(editingPigeon.pigeonColor);
      setClubName(editingPigeon.clubName);
      setClubNumber(editingPigeon.clubNumber);
      setBreederNumber(editingPigeon.breederNumber);
      setPigeonNumber(editingPigeon.pigeonNumber);
      setYear(String(editingPigeon.year).slice(-2));
    } else {
      setPigeonColor("");
      setClubName("");
      setClubNumber("");
      setBreederNumber("");
      setPigeonNumber("");
      setYear("");
    }
  }, [isOpen, editingPigeon]);

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => colorInputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const yearNum = parseInt(year, 10);
  const isValid =
    pigeonColor.trim() !== "" &&
    clubName.trim() !== "" &&
    clubNumber.trim() !== "" &&
    breederNumber.trim() !== "" &&
    pigeonNumber.trim() !== "" &&
    !isNaN(yearNum);

  const previewId =
    clubName.trim() && clubNumber.trim() && breederNumber.trim() && pigeonNumber.trim() && !isNaN(yearNum)
      ? `${clubName.trim()}${clubNumber.trim()}·${breederNumber.trim()}·${pigeonNumber.trim()}·${year.trim()}`
      : "—";

  function handleSubmit() {
    if (!isValid) return;
    const input: PigeonInput = {
      pigeonColor: pigeonColor.trim(),
      clubName: clubName.trim().toUpperCase(),
      clubNumber: clubNumber.trim(),
      breederNumber: breederNumber.trim(),
      pigeonNumber: pigeonNumber.trim(),
      year: yearNum,
    };
    if (editingPigeon) {
      updatePigeon(editingPigeon.id, input);
      toast.success("Golub ažuriran");
    } else {
      addPigeon(input);
      toast.success("Golub dodat");
    }
    onClose();
  }

  const inputClass =
    "w-full px-5 py-3 bg-white/5 border border-white/10 rounded-md text-lg text-white placeholder:text-white/30 focus:border-cyan-brand focus:ring-2 focus:ring-cyan-brand/20 focus:outline-none";
  const labelClass = "block text-base font-medium text-white/80 mb-1.5";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pigeon-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${mounted ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      <div
        className={`relative bg-[#0D2438] rounded-xl shadow-2xl border border-white/10 max-w-2xl w-full mx-4 transition-all duration-200 ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
      >
        <div className="px-8 py-5 border-b border-white/10 flex items-center justify-between">
          <h2
            id="pigeon-modal-title"
            className="text-2xl font-semibold font-rajdhani text-white"
          >
            {editingPigeon ? "Izmeni goluba" : "Dodaj goluba"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zatvori"
            className="text-white/40 hover:text-white/80 transition-colors"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        <div className="p-8 space-y-5">
          <div>
            <label htmlFor="modal-pigeon-color" className={labelClass}>
              Boja goluba <span className="text-red-400">*</span>
            </label>
            <input
              ref={colorInputRef}
              id="modal-pigeon-color"
              type="text"
              value={pigeonColor}
              onChange={(e) => setPigeonColor(e.target.value)}
              placeholder="npr. Arap, Mavijan, Tekir, Darčin"
              maxLength={50}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="modal-club-name" className={labelClass}>
                Naziv kluba <span className="text-red-400">*</span>
              </label>
              <input
                id="modal-club-name"
                type="text"
                value={clubName}
                onChange={(e) => setClubName(e.target.value.toUpperCase())}
                placeholder="npr. SRB"
                maxLength={10}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="modal-club-number" className={labelClass}>
                Br. kluba <span className="text-red-400">*</span>
              </label>
              <input
                id="modal-club-number"
                type="text"
                inputMode="numeric"
                value={clubNumber}
                onChange={(e) => setClubNumber(e.target.value)}
                placeholder="npr. 444"
                maxLength={4}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="modal-breeder-number" className={labelClass}>
                Br. golubara <span className="text-red-400">*</span>
              </label>
              <input
                id="modal-breeder-number"
                type="text"
                inputMode="numeric"
                value={breederNumber}
                onChange={(e) => setBreederNumber(e.target.value)}
                placeholder="npr. 11"
                maxLength={10}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="modal-pigeon-number" className={labelClass}>
                Br. goluba <span className="text-red-400">*</span>
              </label>
              <input
                id="modal-pigeon-number"
                type="text"
                inputMode="numeric"
                value={pigeonNumber}
                onChange={(e) => setPigeonNumber(e.target.value)}
                placeholder="npr. 23"
                maxLength={10}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="modal-year" className={labelClass}>
                Godina <span className="text-red-400">*</span>
              </label>
              <input
                id="modal-year"
                type="text"
                inputMode="numeric"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="npr. 26"
                maxLength={2}
                className={inputClass}
              />
            </div>
          </div>

          <p className="text-base text-white/60">
            Identifikator goluba će biti:{" "}
            <span className="font-mono font-semibold text-white">{previewId}</span>
          </p>
        </div>

        <div className="px-8 py-5 border-t border-white/10 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-md text-base font-medium bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition-colors"
          >
            Otkaži
          </button>
          <button
            type="button"
            disabled={!isValid}
            onClick={handleSubmit}
            className="btn-shine-redesign px-5 py-3 rounded-md text-base font-bold bg-cyan-brand text-sidebar hover:bg-cyan-dark transition-colors disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed"
          >
            Sačuvaj
          </button>
        </div>
      </div>
    </div>
  );
}

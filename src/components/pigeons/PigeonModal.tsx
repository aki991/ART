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

const CURRENT_YEAR = new Date().getFullYear();

export function PigeonModal({ isOpen, onClose, editingPigeon }: PigeonModalProps) {
  const [mounted, setMounted] = useState(false);
  const [pigeonColor, setPigeonColor] = useState("");
  const [clubNumber, setClubNumber] = useState("");
  const [breederNumber, setBreederNumber] = useState("");
  const [pigeonNumber, setPigeonNumber] = useState("");
  const [year, setYear] = useState(String(CURRENT_YEAR));

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
      setClubNumber(editingPigeon.clubNumber);
      setBreederNumber(editingPigeon.breederNumber);
      setPigeonNumber(editingPigeon.pigeonNumber);
      setYear(String(editingPigeon.year));
    } else {
      setPigeonColor("");
      setClubNumber("");
      setBreederNumber("");
      setPigeonNumber("");
      setYear(String(CURRENT_YEAR));
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
    clubNumber.trim() !== "" &&
    /^\d+$/.test(clubNumber.trim()) &&
    breederNumber.trim() !== "" &&
    /^\d+$/.test(breederNumber.trim()) &&
    pigeonNumber.trim() !== "" &&
    /^\d+$/.test(pigeonNumber.trim()) &&
    !isNaN(yearNum) &&
    yearNum >= 1900 &&
    yearNum <= CURRENT_YEAR + 1;

  const yearShort = year.slice(-2).padStart(2, "0");
  const preview =
    clubNumber.trim() && breederNumber.trim() && pigeonNumber.trim() && year && !isNaN(parseInt(year))
      ? `${clubNumber.trim()}-${breederNumber.trim()}-${pigeonNumber.trim()}-${yearShort}`
      : "—";

  function handleSubmit() {
    if (!isValid) return;
    const input: PigeonInput = {
      pigeonColor: pigeonColor.trim(),
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
    "w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:border-cyan-brand focus:ring-2 focus:ring-cyan-brand/20 focus:outline-none";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pigeon-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${mounted ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      <div
        className={`relative bg-white rounded-xl shadow-2xl border border-cyan-brand/15 max-w-md w-full mx-4 transition-all duration-200 ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
      >
        <div className="px-6 py-4 border-b border-cyan-brand/10 flex items-center justify-between">
          <h2
            id="pigeon-modal-title"
            className="text-lg font-semibold font-rajdhani text-gray-900"
          >
            {editingPigeon ? "Izmeni goluba" : "Dodaj goluba"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zatvori"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Boja goluba */}
          <div>
            <label
              htmlFor="modal-pigeon-color"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Boja goluba <span className="text-red-500">*</span>
            </label>
            <input
              ref={colorInputRef}
              id="modal-pigeon-color"
              type="text"
              value={pigeonColor}
              onChange={(e) => setPigeonColor(e.target.value)}
              placeholder="npr. Sivi, Beli, Šaren..."
              maxLength={50}
              className={inputClass}
            />
          </div>

          {/* Grid: Broj kluba, Broj golubara, Broj goluba, Godina */}
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label
                htmlFor="modal-club-number"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Br. kluba <span className="text-red-500">*</span>
              </label>
              <input
                id="modal-club-number"
                type="text"
                inputMode="numeric"
                pattern="[0-9]+"
                value={clubNumber}
                onChange={(e) => setClubNumber(e.target.value)}
                placeholder="12"
                maxLength={4}
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="modal-breeder-number"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Br. golubara <span className="text-red-500">*</span>
              </label>
              <input
                id="modal-breeder-number"
                type="text"
                inputMode="numeric"
                pattern="[0-9]+"
                value={breederNumber}
                onChange={(e) => setBreederNumber(e.target.value)}
                placeholder="12345"
                maxLength={10}
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="modal-pigeon-number"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Br. goluba <span className="text-red-500">*</span>
              </label>
              <input
                id="modal-pigeon-number"
                type="text"
                inputMode="numeric"
                pattern="[0-9]+"
                value={pigeonNumber}
                onChange={(e) => setPigeonNumber(e.target.value)}
                placeholder="67"
                maxLength={10}
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="modal-year"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Godina <span className="text-red-500">*</span>
              </label>
              <input
                id="modal-year"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                min={1900}
                max={CURRENT_YEAR + 1}
                placeholder="2026"
                className={inputClass}
              />
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Identifikator goluba će biti:{" "}
            <span className="font-mono font-medium text-gray-700">{preview}</span>
          </p>
        </div>

        <div className="px-6 py-4 border-t border-cyan-brand/10 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-md text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Otkaži
          </button>
          <button
            type="button"
            disabled={!isValid}
            onClick={handleSubmit}
            className="btn-shine-redesign px-4 py-2.5 rounded-md text-sm font-medium bg-cyan-brand text-white hover:bg-cyan-dark transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            Sačuvaj
          </button>
        </div>
      </div>
    </div>
  );
}

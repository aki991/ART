"use client";

import { useEffect, useRef, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createPigeon, updatePigeon } from "@/app/actions/pigeons";
import type { Pigeon, PigeonInput } from "@/lib/types/pigeon";

interface PigeonModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPigeon?: Pigeon | null;
  onSaved: (pigeon: Pigeon, mode: "create" | "update") => void;
}

const FIELD_WRAP =
  "px-2 py-2.5 bg-bg-input border border-border rounded-md text-lg text-text-primary placeholder:text-text-disabled focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none text-center font-mono";

export function PigeonModal({ isOpen, onClose, editingPigeon, onSaved }: PigeonModalProps) {
  const [mounted, setMounted] = useState(false);
  const [ringCountry, setRingCountry] = useState("SRB");
  const [ringNumber, setRingNumber] = useState("");
  const [ringSegment3, setRingSegment3] = useState("");
  const [ringSegment4, setRingSegment4] = useState("");
  const [ringYear, setRingYear] = useState("");
  const [color, setColor] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ringCountryRef = useRef<HTMLInputElement>(null);
  const ringNumberRef = useRef<HTMLInputElement>(null);
  const ringSegment3Ref = useRef<HTMLInputElement>(null);
  const ringSegment4Ref = useRef<HTMLInputElement>(null);
  const ringYearRef = useRef<HTMLInputElement>(null);
  const colorRef = useRef<HTMLInputElement>(null);

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
    setError(null);
    if (editingPigeon) {
      setRingCountry(editingPigeon.ring_country);
      setRingNumber(editingPigeon.ring_number);
      setRingSegment3(editingPigeon.ring_segment_3);
      setRingSegment4(editingPigeon.ring_segment_4);
      setRingYear(editingPigeon.ring_year);
      setColor(editingPigeon.color);
      setName(editingPigeon.name ?? "");
    } else {
      setRingCountry("SRB");
      setRingNumber("");
      setRingSegment3("");
      setRingSegment4("");
      setRingYear("");
      setColor("");
      setName("");
    }
  }, [isOpen, editingPigeon]);

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => {
      if (editingPigeon) colorRef.current?.focus();
      else ringNumberRef.current?.focus();
    }, 60);
    return () => clearTimeout(t);
  }, [isOpen, editingPigeon]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !submitting) onClose();
    }
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose, submitting]);

  if (!isOpen) return null;

  const previewId =
    ringCountry.trim() && ringNumber.trim() && ringSegment3.trim() && ringSegment4.trim() && ringYear.trim()
      ? `${ringCountry.trim().toUpperCase()}-${ringNumber.trim()}-${ringSegment3.trim()}-${ringSegment4.trim()}-${ringYear.trim()}`
      : "—";

  const isValid =
    ringCountry.trim() !== "" &&
    ringNumber.trim() !== "" &&
    ringSegment3.trim() !== "" &&
    ringSegment4.trim() !== "" &&
    ringYear.trim() !== "" &&
    color.trim() !== "";

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text").trim();
    const match = text.match(/^([A-Za-z]{1,3})[\-·](\d{1,4})[\-·](\d{1,2})[\-·](\d{1,2})[\-·](\d{2})$/);
    if (match) {
      e.preventDefault();
      setRingCountry(match[1].toUpperCase());
      setRingNumber(match[2]);
      setRingSegment3(match[3]);
      setRingSegment4(match[4]);
      setRingYear(match[5]);
      colorRef.current?.focus();
    }
  }

  async function handleSubmit() {
    if (!isValid || submitting) return;
    setError(null);
    setSubmitting(true);

    const input: PigeonInput = {
      ringCountry: ringCountry.trim(),
      ringNumber: ringNumber.trim(),
      ringSegment3: ringSegment3.trim(),
      ringSegment4: ringSegment4.trim(),
      ringYear: ringYear.trim(),
      color: color.trim(),
      name: name.trim() || undefined,
    };

    const res = editingPigeon
      ? await updatePigeon(editingPigeon.id, input)
      : await createPigeon(input);

    setSubmitting(false);

    if (!res.success) {
      setError(res.error);
      toast.error(editingPigeon ? "Izmena neuspešna" : "Dodavanje neuspešno", {
        description: res.error,
      });
      return;
    }

    toast.success(editingPigeon ? "Golub ažuriran" : "Golub dodat");
    onSaved(res.data, editingPigeon ? "update" : "create");
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pigeon-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200",
          mounted ? "opacity-100" : "opacity-0"
        )}
        onClick={() => !submitting && onClose()}
      />

      <div
        className={cn(
          "relative bg-bg-surface-elevated rounded-xl shadow-lg border border-border max-w-2xl w-full mx-4 transition-all duration-200",
          mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}
      >
        <div className="px-8 py-5 border-b border-border flex items-center justify-between">
          <h2
            id="pigeon-modal-title"
            className="text-2xl font-semibold font-rajdhani text-text-primary"
          >
            {editingPigeon ? "Izmeni goluba" : "Dodaj novog goluba"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Zatvori"
            className="text-text-disabled hover:text-text-primary transition-colors disabled:opacity-40"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        <div className="p-8 space-y-5">
          <div>
            <label className="block text-base font-medium text-text-secondary mb-1.5">
              Broj savezne alke <span className="text-status-error">*</span>
            </label>
            <div className="flex items-center gap-1.5">
              <input
                ref={ringCountryRef}
                type="text"
                maxLength={3}
                value={ringCountry}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 3);
                  setRingCountry(v);
                  if (v.length === 3) ringNumberRef.current?.focus();
                }}
                onPaste={handlePaste}
                placeholder="SRB"
                aria-label="Prefiks države"
                className={cn(FIELD_WRAP, "w-20")}
              />
              <span className="text-text-disabled select-none font-mono">-</span>
              <input
                ref={ringNumberRef}
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={ringNumber}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setRingNumber(v);
                  if (v.length === 4) ringSegment3Ref.current?.focus();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !ringNumber) ringCountryRef.current?.focus();
                }}
                placeholder="444"
                aria-label="Broj kluba"
                className={cn(FIELD_WRAP, "w-20")}
              />
              <span className="text-text-disabled select-none font-mono">-</span>
              <input
                ref={ringSegment3Ref}
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={ringSegment3}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 2);
                  setRingSegment3(v);
                  if (v.length === 2) ringSegment4Ref.current?.focus();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !ringSegment3) ringNumberRef.current?.focus();
                }}
                placeholder="11"
                aria-label="Treći segment"
                className={cn(FIELD_WRAP, "w-14")}
              />
              <span className="text-text-disabled select-none font-mono">-</span>
              <input
                ref={ringSegment4Ref}
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={ringSegment4}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 2);
                  setRingSegment4(v);
                  if (v.length === 2) ringYearRef.current?.focus();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !ringSegment4) ringSegment3Ref.current?.focus();
                }}
                placeholder="22"
                aria-label="Četvrti segment"
                className={cn(FIELD_WRAP, "w-14")}
              />
              <span className="text-text-disabled select-none font-mono">-</span>
              <input
                ref={ringYearRef}
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={ringYear}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 2);
                  setRingYear(v);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !ringYear) ringSegment4Ref.current?.focus();
                }}
                placeholder="25"
                aria-label="Godina"
                className={cn(FIELD_WRAP, "w-14")}
              />
            </div>
            <p className="text-sm text-text-tertiary mt-1.5">
              Pun broj alke:{" "}
              <span className="font-mono font-semibold text-text-primary">{previewId}</span>
            </p>
          </div>

          <div>
            <label htmlFor="modal-pigeon-color" className="block text-base font-medium text-text-secondary mb-1.5">
              Boja goluba <span className="text-status-error">*</span>
            </label>
            <input
              ref={colorRef}
              id="modal-pigeon-color"
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="npr. Arap, Mavijan, Tekir..."
              maxLength={50}
              className="w-full px-5 py-3 bg-bg-input border border-border rounded-md text-lg text-text-primary placeholder:text-text-disabled focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="modal-pigeon-name" className="block text-base font-medium text-text-secondary mb-1.5">
              Ime goluba
            </label>
            <input
              id="modal-pigeon-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Opciono"
              maxLength={50}
              className="w-full px-5 py-3 bg-bg-input border border-border rounded-md text-lg text-text-primary placeholder:text-text-disabled focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="text-sm text-status-error bg-bg-error-light border border-status-error/30 rounded-md px-3 py-2"
            >
              {error}
            </div>
          )}
        </div>

        <div className="px-8 py-5 border-t border-border flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-5 py-3 rounded-md text-base font-medium bg-bg-input border border-border text-text-secondary hover:bg-bg-hover transition-colors disabled:opacity-40"
          >
            Otkaži
          </button>
          <button
            type="button"
            disabled={!isValid || submitting}
            onClick={handleSubmit}
            className="btn-shine-redesign px-5 py-3 rounded-md text-base font-bold bg-accent text-text-on-accent hover:bg-accent-hover transition-colors disabled:bg-bg-hover disabled:text-text-disabled disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            {editingPigeon ? "Sačuvaj izmene" : "Dodaj goluba"}
          </button>
        </div>
      </div>
    </div>
  );
}

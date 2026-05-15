"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { TranslationKey } from "./translations";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: Record<TranslationKey, string>;
}

export function ForgotPasswordModal({
  isOpen,
  onClose,
  t,
}: ForgotPasswordModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen || typeof window === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-password-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-[#0f1620] border border-white/10 shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3
            id="forgot-password-title"
            className="text-lg font-semibold text-white font-rajdhani"
          >
            {t.forgotModalTitle}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zatvori"
            className="text-white/40 hover:text-white transition-colors"
          >
            <X size={18} strokeWidth={1.6} />
          </button>
        </div>
        <p className="text-sm text-white/70">{t.forgotModalBody}</p>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-cyan-brand/20 border border-cyan-brand/40 text-cyan-brand text-sm font-medium hover:bg-cyan-brand/30 transition-colors"
          >
            {t.forgotModalClose}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

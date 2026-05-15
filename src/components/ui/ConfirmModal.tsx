"use client";

import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Input } from "./Input";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  loading?: boolean;
  // When set, the user must type this exact text before confirm is enabled.
  confirmationText?: string;
  confirmationLabel?: string;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Potvrdi",
  cancelLabel = "Odustani",
  variant = "default",
  loading = false,
  confirmationText,
  confirmationLabel,
}: ConfirmModalProps) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (!isOpen) setTyped("");
  }, [isOpen]);

  const gateOk = !confirmationText || typed.trim() === confirmationText;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            disabled={!gateOk}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="text-base text-text-secondary leading-relaxed">{message}</div>
        {confirmationText && (
          <Input
            label={confirmationLabel}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={confirmationText}
            autoComplete="off"
          />
        )}
      </div>
    </Modal>
  );
}

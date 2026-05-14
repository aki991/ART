"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Strength = 0 | 1 | 2 | 3;

function scorePassword(pw: string): Strength {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 2) return 1;
  if (score <= 3) return 2;
  return 3;
}

const STRENGTH_META: Record<
  Strength,
  { label: string; bar: string; text: string; width: string }
> = {
  0: { label: "", bar: "", text: "", width: "w-0" },
  1: { label: "Slaba", bar: "bg-cyan-brand", text: "text-cyan-brand", width: "w-1/3" },
  2: { label: "Srednja", bar: "bg-yellow-400", text: "text-yellow-400", width: "w-2/3" },
  3: { label: "Jaka", bar: "bg-green-400", text: "text-green-400", width: "w-full" },
};

export function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrent("");
      setNext("");
      setConfirm("");
      setSubmitting(false);
    }
  }, [isOpen]);

  const strength = useMemo(() => scorePassword(next), [next]);
  const strengthMeta = STRENGTH_META[strength];

  const newTooShort = next.length > 0 && next.length < 8;
  const mismatch = confirm.length > 0 && confirm !== next;
  const canSubmit =
    current.trim().length > 0 &&
    next.length >= 8 &&
    confirm === next &&
    !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    // Frontend-only prototype: no real credentials to verify against.
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSubmitting(false);
    onClose();
    toast.success("Lozinka promenjena ✓");
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Promena lozinke"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Odustani
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!canSubmit}
            loading={submitting}
          >
            Sačuvaj novu lozinku
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Trenutna lozinka"
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          autoComplete="current-password"
        />

        <div>
          <Input
            label="Nova lozinka"
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            autoComplete="new-password"
            error={
              newTooShort
                ? "Lozinka mora imati najmanje 8 karaktera."
                : undefined
            }
          />
          {strength > 0 && (
            <div className="mt-2">
              <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    strengthMeta.bar,
                    strengthMeta.width
                  )}
                />
              </div>
              <p className={cn("mt-1 text-sm", strengthMeta.text)}>
                Jačina lozinke: {strengthMeta.label}
              </p>
            </div>
          )}
        </div>

        <Input
          label="Potvrdi novu lozinku"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          error={mismatch ? "Lozinke se ne poklapaju." : undefined}
        />
      </div>
    </Modal>
  );
}

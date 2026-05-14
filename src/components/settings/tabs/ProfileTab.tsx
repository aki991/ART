"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Camera, KeyRound, Trash2, TriangleAlert } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useSettingsStore } from "@/lib/store/settings-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { MOCK_CLUB_MEMBERS } from "@/lib/data/mock-clubs";
import { readImageFile } from "@/lib/settings/image-upload";
import type { ProfileData } from "@/lib/settings/types";
import { ChangePasswordModal } from "../modals/ChangePasswordModal";

// Frontend-only stand-in for a backend uniqueness check.
const TAKEN_USERNAMES = new Set(
  Object.values(MOCK_CLUB_MEMBERS)
    .flat()
    .map((m) => m.username.toLowerCase())
);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

interface ProfileTabProps {
  value: ProfileData;
  onChange: (next: ProfileData) => void;
}

export function ProfileTab({ value, onChange }: ProfileTabProps) {
  const router = useRouter();
  const savedUsername = useSettingsStore((s) => s.profile.username);
  const deleteAccount = useSettingsStore((s) => s.deleteAccount);
  const logout = useAuthStore((s) => s.logout);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");

  // Debounced (500ms) uniqueness check for the username.
  useEffect(() => {
    const uname = value.username.trim();
    if (uname === savedUsername) {
      setUsernameStatus("idle");
      return;
    }
    if (uname.length < 3 || !/^[a-zA-Z0-9_]+$/.test(uname)) {
      setUsernameStatus("invalid");
      return;
    }
    setUsernameStatus("checking");
    const t = setTimeout(() => {
      setUsernameStatus(
        TAKEN_USERNAMES.has(uname.toLowerCase()) ? "taken" : "available"
      );
    }, 500);
    return () => clearTimeout(t);
  }, [value.username, savedUsername]);

  function patch<K extends keyof ProfileData>(key: K, v: ProfileData[K]) {
    onChange({ ...value, [key]: v });
  }

  function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) readImageFile(file, (dataUrl) => patch("avatar", dataUrl));
  }

  function handleDeleteAccount() {
    deleteAccount();
    logout();
    setDeleteOpen(false);
    toast.success("Nalog obrisan");
    router.push("/");
  }

  const emailInvalid =
    value.email.trim().length > 0 && !EMAIL_RE.test(value.email.trim());
  const usernameError =
    usernameStatus === "taken"
      ? "Korisničko ime je već zauzeto."
      : usernameStatus === "invalid"
        ? "Najmanje 3 karaktera — slova, brojevi i _."
        : undefined;
  const usernameHint =
    usernameStatus === "checking"
      ? "Provera dostupnosti..."
      : usernameStatus === "available"
        ? "Korisničko ime je dostupno."
        : undefined;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Avatar */}
      <div className="card-redesign p-6">
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Promeni avatar"
            className="rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-brand/40 group relative"
          >
            <Avatar
              src={value.avatar}
              name={value.firstName || value.username}
              size="xl"
            />
            <span className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" aria-hidden="true" />
            </span>
          </button>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-4 h-4" aria-hidden="true" />
                Promeni
              </Button>
              {value.avatar && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => patch("avatar", null)}
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                  Ukloni
                </Button>
              )}
            </div>
            <p className="text-sm text-white/40">JPG ili PNG, do 2MB.</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleAvatarFile}
            className="hidden"
          />
        </div>
      </div>

      {/* Basic info */}
      <div className="card-redesign p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Ime"
            required
            value={value.firstName}
            onChange={(e) => patch("firstName", e.target.value)}
            error={value.firstName.trim() === "" ? "Obavezno polje." : undefined}
          />
          <Input
            label="Prezime"
            required
            value={value.lastName}
            onChange={(e) => patch("lastName", e.target.value)}
            error={value.lastName.trim() === "" ? "Obavezno polje." : undefined}
          />
        </div>
        <Input
          label="Korisničko ime"
          required
          value={value.username}
          onChange={(e) => patch("username", e.target.value)}
          error={usernameError}
          hint={usernameHint}
        />
        <Input
          label="Email"
          required
          type="email"
          value={value.email}
          onChange={(e) => patch("email", e.target.value)}
          error={
            value.email.trim() === ""
              ? "Obavezno polje."
              : emailInvalid
                ? "Unesite ispravnu email adresu."
                : undefined
          }
        />
        <Input
          label="Telefon"
          type="tel"
          value={value.phone}
          onChange={(e) => patch("phone", e.target.value)}
          placeholder="+381 60 123 4567"
          hint="Opciono."
        />
      </div>

      {/* Password */}
      <div className="card-redesign p-6 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-white">Lozinka</h3>
          <p className="text-sm text-white/40 mt-0.5">
            Promenite lozinku za pristup nalogu.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => setPasswordOpen(true)}
          className="flex-shrink-0"
        >
          <KeyRound className="w-4 h-4" aria-hidden="true" />
          Promeni lozinku
        </Button>
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6">
        <div className="flex items-center gap-2 mb-3">
          <TriangleAlert
            className="w-4 h-4 text-red-400"
            aria-hidden="true"
          />
          <h3 className="text-base font-semibold text-red-400">Opasna zona</h3>
        </div>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-white/50">
            Brisanje naloga je trajno i ne može se opozvati.
          </p>
          <Button
            variant="danger"
            onClick={() => setDeleteOpen(true)}
            className="flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            Obriši nalog
          </Button>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={passwordOpen}
        onClose={() => setPasswordOpen(false)}
      />

      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Obriši nalog"
        message={
          <>
            Ova akcija trajno briše vaš nalog i sve povezane postavke. Da biste
            potvrdili, ukucajte svoje korisničko ime{" "}
            <span className="font-mono text-white">{savedUsername}</span> ispod.
          </>
        }
        confirmLabel="Trajno obriši nalog"
        variant="danger"
        confirmationText={savedUsername}
        confirmationLabel="Korisničko ime"
      />
    </div>
  );
}

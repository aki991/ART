"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Camera, KeyRound, Trash2, TriangleAlert, Globe, Lock } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { createClient } from "@/lib/supabase/client";
import { deleteAccountAction } from "@/app/auth/actions";
import { clearAllStores } from "@/lib/store/clear-all";
import { toggleProfilePrivacy } from "@/app/actions/profile";
import { readImageFile } from "@/lib/settings/image-upload";
import type { ProfileData } from "@/lib/settings/types";
import { ChangePasswordModal } from "../modals/ChangePasswordModal";

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

interface ProfileTabProps {
  value: ProfileData;
  onChange: (next: ProfileData) => void;
  isPublicProfile: boolean;
}

export function ProfileTab({ value, onChange, isPublicProfile }: ProfileTabProps) {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const savedUsername = currentUser.profile?.username ?? "";

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [isPublic, setIsPublic] = useState(isPublicProfile);
  const [togglingPrivacy, setTogglingPrivacy] = useState(false);

  // Debounced (500ms) uniqueness check for the username — hits Supabase.
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
    let cancelled = false;
    const t = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", uname)
        .neq("id", currentUser.id)
        .maybeSingle();
      if (cancelled) return;
      setUsernameStatus(data ? "taken" : "available");
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [value.username, savedUsername, currentUser.id]);

  function patch<K extends keyof ProfileData>(key: K, v: ProfileData[K]) {
    onChange({ ...value, [key]: v });
  }

  function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) readImageFile(file, (dataUrl) => patch("avatar", dataUrl));
  }

  async function handleDeleteAccount() {
    if (deleting) return;
    setDeleting(true);
    const result = await deleteAccountAction();
    setDeleting(false);
    if (!result.ok) {
      toast.error("Brisanje naloga nije uspelo.");
      return;
    }
    setDeleteOpen(false);
    toast.success("Nalog obrisan");
    clearAllStores();
    router.replace("/");
    router.refresh();
  }

  async function handleTogglePrivacy() {
    const next = !isPublic;
    setTogglingPrivacy(true);
    const res = await toggleProfilePrivacy(next);
    setTogglingPrivacy(false);
    if (!res.success) {
      toast.error("Promena privatnosti nije uspela", {
        description: res.error,
      });
      return;
    }
    setIsPublic(next);
    toast.success(next ? "Profil je sada javan" : "Profil je sada privatan");
  }

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
            className="rounded-full focus:outline-none focus:ring-2 focus:ring-accent/40 group relative"
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
            <p className="text-sm text-text-disabled">JPG ili PNG, do 2MB.</p>
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
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Email
          </label>
          <div className="px-3 py-2 rounded-md bg-bg-input border border-border text-text-tertiary text-sm">
            {currentUser.email}
          </div>
          <p className="mt-1 text-xs text-text-disabled">
            Email se ne može menjati iz ovog ekrana.
          </p>
        </div>
        <Input
          label="Telefon"
          type="tel"
          value={value.phone}
          onChange={(e) => patch("phone", e.target.value)}
          placeholder="+381 60 123 4567"
          hint="Opciono."
        />
      </div>

      {/* Privatnost profila */}
      <div className="card-redesign p-6">
        <h3 className="text-base font-semibold text-text-primary">
          Privatnost profila
        </h3>
        <p className="text-sm text-text-disabled mt-0.5 mb-4 max-lg:text-xs">
          Kontrolišite ko može da vidi vašu javnu profil stranicu.
        </p>
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {isPublic ? (
                <Globe className="w-4 h-4 text-accent" aria-hidden="true" />
              ) : (
                <Lock className="w-4 h-4 text-text-tertiary" aria-hidden="true" />
              )}
              <span className="text-sm font-medium text-text-primary">
                {isPublic ? "Javan profil" : "Privatan profil"}
              </span>
            </div>
            <p className="text-xs text-text-tertiary">
              {isPublic
                ? "Bilo ko sa linkom može da vidi vaš profil bez prijave."
                : "Samo vi vidite svoj profil; javni link vraća „nije pronađen“."}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isPublic}
            aria-label="Privatnost profila"
            onClick={handleTogglePrivacy}
            disabled={togglingPrivacy}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
              isPublic ? "bg-accent" : "bg-bg-hover border border-border"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isPublic ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Password */}
      <div className="card-redesign p-6 flex items-center justify-between gap-4 max-lg:flex-col max-lg:items-stretch max-lg:gap-3 max-lg:p-4">
        <div>
          <h3 className="text-base font-semibold text-text-primary">Lozinka</h3>
          <p className="text-sm text-text-disabled mt-0.5 max-lg:text-xs">
            Promenite lozinku za pristup nalogu.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => setPasswordOpen(true)}
          className="flex-shrink-0 max-lg:w-full max-lg:!py-2 max-lg:!text-sm"
        >
          <KeyRound className="w-4 h-4" aria-hidden="true" />
          Promeni lozinku
        </Button>
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border border-status-error bg-bg-error-light p-6 max-lg:p-4">
        <div className="flex items-center gap-2 mb-3">
          <TriangleAlert
            className="w-4 h-4 text-status-error"
            aria-hidden="true"
          />
          <h3 className="text-base font-semibold text-status-error">Opasna zona</h3>
        </div>
        <div className="flex items-center justify-between gap-4 max-lg:flex-col max-lg:items-stretch max-lg:gap-3">
          <p className="text-sm text-text-tertiary max-lg:text-xs">
            Brisanje naloga je trajno i ne može se opozvati.
          </p>
          <Button
            variant="danger"
            onClick={() => setDeleteOpen(true)}
            className="flex-shrink-0 max-lg:w-full max-lg:!py-2 max-lg:!text-sm"
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
            <span className="text-text-primary">{savedUsername}</span> ispod.
          </>
        }
        confirmLabel={deleting ? "Brisanje…" : "Trajno obriši nalog"}
        variant="danger"
        confirmationText={savedUsername}
        confirmationLabel="Korisničko ime"
      />
    </div>
  );
}

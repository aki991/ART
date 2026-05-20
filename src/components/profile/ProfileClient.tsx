"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Camera, Trash2, Loader2, Globe, Lock, Copy, Check, Save } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { readImageFile } from "@/lib/settings/image-upload";
import { saveAvatar, deleteAvatar, updateBio } from "@/app/actions/profile";
import type { PublicProfile } from "@/app/actions/profile";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

interface Props {
  profile: PublicProfile;
}

export function ProfileClient({ profile: initialProfile }: Props) {
  const [profile, setProfile] = useState(initialProfile);
  const [bio, setBio] = useState(initialProfile.bio ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingAvatar, setDeletingAvatar] = useState(false);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const fullName =
    `${profile.first_name} ${profile.last_name}`.trim() || profile.username;
  const publicUrl = `${origin}/u/${profile.username}`;

  function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    // readImageFile validira (JPG/PNG, ≤2MB) i prikazuje toast pri grešci.
    readImageFile(file, async (dataUrl) => {
      setIsUploading(true);
      const res = await saveAvatar(dataUrl);
      setIsUploading(false);
      if (!res.success) {
        toast.error("Greška pri čuvanju avatara", { description: res.error });
        return;
      }
      setProfile((p) => ({ ...p, avatar_url: res.data.avatar_url }));
      toast.success("Avatar sačuvan");
    });
  }

  async function handleDeleteAvatar() {
    setDeletingAvatar(true);
    const res = await deleteAvatar();
    setDeletingAvatar(false);
    setDeleteOpen(false);
    if (!res.success) {
      toast.error("Brisanje nije uspelo", { description: res.error });
      return;
    }
    setProfile((p) => ({ ...p, avatar_url: null }));
    toast.success("Avatar uklonjen");
  }

  async function handleSaveBio() {
    setIsSavingBio(true);
    const res = await updateBio(bio);
    setIsSavingBio(false);
    if (!res.success) {
      toast.error("Greška pri čuvanju", { description: res.error });
      return;
    }
    setProfile((p) => ({ ...p, bio: res.data.bio }));
    setBio(res.data.bio ?? "");
    toast.success("Bio sačuvan");
  }

  async function handleCopyUrl() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Kopiranje nije uspelo");
    }
  }

  const bioChanged = bio !== (profile.bio ?? "");

  return (
    <div className="px-4 lg:px-8 py-4 lg:py-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl lg:text-3xl font-bold text-text-primary font-rajdhani">
        Moj profil
      </h1>

      {/* AVATAR */}
      <div className="bg-bg-surface border border-accent/15 rounded-xl p-6">
        <div className="flex items-start gap-5">
          <div className="relative flex-shrink-0">
            <Avatar
              src={profile.avatar_url}
              name={fullName}
              size="xl"
              className="lg:w-32 lg:h-32 lg:text-5xl"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              aria-label="Promeni avatar"
              className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-accent text-text-on-accent flex items-center justify-center hover:bg-accent-hover transition-colors disabled:opacity-60"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Camera className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleAvatarFile}
              className="hidden"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-text-primary truncate">
              {fullName}
            </h2>
            <p className="text-sm text-text-tertiary">@{profile.username}</p>
            <p className="text-xs text-text-tertiary mt-1">
              Član od {formatDate(profile.created_at)}
            </p>
            {profile.avatar_url && (
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                disabled={isUploading}
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-status-error hover:underline disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                Ukloni avatar
              </button>
            )}
            <p className="text-xs text-text-disabled mt-2">JPG ili PNG, do 2MB.</p>
          </div>
        </div>
      </div>

      {/* PRIVATNOST / PUBLIC URL */}
      {profile.is_public_profile ? (
        <div className="bg-bg-surface border border-accent/15 rounded-xl p-4 lg:p-5">
          <div className="flex items-start gap-3">
            <Globe className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-text-primary mb-1">
                Vaš profil je javan
              </h3>
              <p className="text-xs text-text-tertiary mb-3">
                Bilo ko sa ovim linkom može da vidi vaš profil bez prijavljivanja:
              </p>
              <div className="flex items-center gap-2 bg-bg-input border border-border rounded-md px-3 py-2">
                <code className="flex-1 text-xs text-text-secondary font-mono truncate">
                  {publicUrl || `…/u/${profile.username}`}
                </code>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-hover flex-shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      Kopirano
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      Kopiraj
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-text-tertiary mt-2">
                Privatnost možete promeniti u{" "}
                <Link href="/settings#profil" className="text-accent hover:underline">
                  Postavkama
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-bg-surface border border-accent/15 rounded-xl p-4 lg:p-5">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-text-tertiary flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-text-primary mb-1">
                Vaš profil je privatan
              </h3>
              <p className="text-xs text-text-tertiary">
                Samo vi vidite svoj profil. Da ga podelite, uključite javnost u{" "}
                <Link href="/settings#profil" className="text-accent hover:underline">
                  Postavkama
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      )}

      {/* BIO */}
      <div className="bg-bg-surface border border-accent/15 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-3">O meni</h3>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={500}
          rows={4}
          placeholder="Napišite nešto o sebi i vašim golubovima..."
          className="w-full p-3 bg-bg-input border border-border rounded-md text-text-primary placeholder:text-text-disabled resize-none focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-text-tertiary">{bio.length} / 500</span>
          <button
            type="button"
            onClick={handleSaveBio}
            disabled={isSavingBio || !bioChanged}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold bg-accent text-text-on-accent hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSavingBio ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="w-4 h-4" aria-hidden="true" />
            )}
            Sačuvaj
          </button>
        </div>
      </div>

      {/* STATISTIKE */}
      <div className="bg-bg-surface border border-accent/15 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Statistike</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatItem label="Golubova" value={profile.stats.total_pigeons.toString()} />
          <StatItem label="Letova" value={profile.stats.total_races.toString()} />
          <StatItem label="Validnih" value={profile.stats.valid_races.toString()} />
          <StatItem
            label="Max visina"
            value={
              profile.stats.max_altitude_ever
                ? `${profile.stats.max_altitude_ever}m`
                : "—"
            }
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => !deletingAvatar && setDeleteOpen(false)}
        onConfirm={handleDeleteAvatar}
        title="Ukloni avatar"
        message="Da li ste sigurni da želite da uklonite svoj avatar?"
        confirmLabel="Ukloni"
        cancelLabel="Otkaži"
        variant="danger"
        loading={deletingAvatar}
      />
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-text-tertiary uppercase tracking-wide mb-1">
        {label}
      </div>
      <div className="text-2xl font-bold text-text-primary font-rajdhani">
        {value}
      </div>
    </div>
  );
}

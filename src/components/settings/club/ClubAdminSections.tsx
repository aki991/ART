"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Crown, ShieldCheck, Trash2, UserMinus } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useSettingsStore } from "@/lib/store/settings-store";
import { CURRENT_USER_ID } from "@/lib/data/mock-clubs";
import { readImageFile } from "@/lib/settings/image-upload";
import type { Club, ClubEditableData, ClubMember } from "@/lib/settings/types";

interface ClubAdminSectionsProps {
  club: Club;
  clubDraft: ClubEditableData;
  onClubDraftChange: (next: ClubEditableData) => void;
}

// Stable reference — a fresh [] in the selector would loop zustand's snapshot check.
const EMPTY: never[] = [];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("sr-RS");
}

type PendingMemberAction =
  | { type: "remove"; member: ClubMember }
  | { type: "transfer"; member: ClubMember }
  | null;

export function ClubAdminSections({
  club,
  clubDraft,
  onClubDraftChange,
}: ClubAdminSectionsProps) {
  const requests = useSettingsStore((s) => s.joinRequests[club.id] ?? EMPTY);
  const members = useSettingsStore((s) => s.members[club.id] ?? EMPTY);
  const approveJoinRequest = useSettingsStore((s) => s.approveJoinRequest);
  const rejectJoinRequest = useSettingsStore((s) => s.rejectJoinRequest);
  const removeMember = useSettingsStore((s) => s.removeMember);
  const transferAdmin = useSettingsStore((s) => s.transferAdmin);
  const deleteClub = useSettingsStore((s) => s.deleteClub);

  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingAction, setPendingAction] = useState<PendingMemberAction>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function patch<K extends keyof ClubEditableData>(
    key: K,
    v: ClubEditableData[K]
  ) {
    onClubDraftChange({ ...clubDraft, [key]: v });
  }

  function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) readImageFile(file, (dataUrl) => patch("logo", dataUrl));
  }

  function handleApprove(reqId: string, name: string) {
    approveJoinRequest(club.id, reqId);
    toast.success(`${name} je sada član kluba`);
  }

  function handleReject(reqId: string) {
    rejectJoinRequest(club.id, reqId);
    toast.success("Zahtev odbijen");
  }

  function confirmMemberAction() {
    if (!pendingAction) return;
    const { type, member } = pendingAction;
    const name = `${member.firstName} ${member.lastName}`;
    if (type === "remove") {
      removeMember(club.id, member.userId);
      toast.success(`${name} je uklonjen iz kluba`);
    } else {
      transferAdmin(club.id, member.userId);
      toast.success(`${name} je sada administrator kluba`);
    }
    setPendingAction(null);
  }

  function handleDeleteClub() {
    deleteClub(club.id);
    setDeleteOpen(false);
    toast.success("Klub obrisan");
  }

  return (
    <div className="space-y-6">
      {/* a) Editable club data */}
      <div className="card-redesign p-6 space-y-5 max-w-2xl">
        <h2 className="text-lg font-semibold text-white font-rajdhani">
          Podaci o klubu
        </h2>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label="Promeni logo kluba"
            className="rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-brand/40 group relative"
          >
            <Avatar src={clubDraft.logo} name={clubDraft.name || "K"} size="lg" />
            <span className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" aria-hidden="true" />
            </span>
          </button>
          <div className="space-y-1.5">
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileRef.current?.click()}
              >
                <Camera className="w-4 h-4" aria-hidden="true" />
                Logo
              </Button>
              {clubDraft.logo && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => patch("logo", null)}
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                  Ukloni
                </Button>
              )}
            </div>
            <p className="text-sm text-white/40">JPG ili PNG, do 2MB.</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleLogoFile}
            className="hidden"
          />
        </div>

        <Input
          label="Naziv kluba"
          required
          value={clubDraft.name}
          onChange={(e) => patch("name", e.target.value)}
          error={clubDraft.name.trim() === "" ? "Obavezno polje." : undefined}
        />
        <Input
          label="Lokacija (grad)"
          required
          value={clubDraft.city}
          onChange={(e) => patch("city", e.target.value)}
          error={clubDraft.city.trim() === "" ? "Obavezno polje." : undefined}
        />
        <Textarea
          label="Opis kluba"
          value={clubDraft.description}
          onChange={(e) => patch("description", e.target.value)}
          placeholder="Kratak opis kluba (opciono)"
          hint="Opciono."
        />
      </div>

      {/* b) Join requests — only shown when there are active requests */}
      {requests.length > 0 && (
        <div className="card-redesign max-w-2xl">
          <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white font-rajdhani">
              Zahtevi za članstvo
            </h2>
            <span className="bg-cyan-brand/10 text-cyan-brand rounded-full px-2 py-0.5 text-xs font-medium">
              {requests.length}
            </span>
          </div>
          <ul className="divide-y divide-white/5">
            {requests.map((req) => (
              <li key={req.id} className="px-6 py-3 flex items-center gap-3">
                <Avatar src={req.avatar} name={req.firstName} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-white font-medium truncate">
                    {req.firstName} {req.lastName}
                  </p>
                  <p className="text-sm text-white/50 truncate">
                    @{req.username} · {formatDate(req.requestedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      handleApprove(
                        req.id,
                        `${req.firstName} ${req.lastName}`
                      )
                    }
                  >
                    Prihvati
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleReject(req.id)}
                  >
                    Odbij
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* c) Members */}
      <div className="card-redesign">
        <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
          <h2 className="text-lg font-semibold text-white font-rajdhani">
            Članovi kluba
          </h2>
          <span className="bg-white/10 text-white/60 rounded-full px-2 py-0.5 text-sm">
            {members.length}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="table-header-gradient">
                <th className="px-6 py-3 text-left text-sm font-medium text-white/60 uppercase tracking-wider">
                  Član
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white/60 uppercase tracking-wider">
                  Korisničko ime
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white/60 uppercase tracking-wider">
                  Pridružen
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white/60 uppercase tracking-wider">
                  Uloga
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-white/60 uppercase tracking-wider">
                  Akcije
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const isSelf = m.userId === CURRENT_USER_ID;
                const isAdmin = m.role === "admin";
                return (
                  <tr key={m.userId} className="border-t border-white/5">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar src={m.avatar} name={m.firstName} size="sm" />
                        <span className="text-white">
                          {m.firstName} {m.lastName}
                          {isSelf && (
                            <span className="text-white/40"> (Vi)</span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3 font-mono text-sm text-white/70">
                      @{m.username}
                    </td>
                    <td className="px-6 py-3 text-white/70">
                      {formatDate(m.joinedAt)}
                    </td>
                    <td className="px-6 py-3">
                      {isAdmin ? (
                        <span className="inline-flex items-center gap-1 text-sm bg-cyan-brand/10 text-cyan-brand border border-cyan-brand/30 px-2 py-0.5 rounded-full">
                          <Crown className="w-3 h-3" aria-hidden="true" />
                          Admin
                        </span>
                      ) : (
                        <span className="text-sm bg-white/5 text-white/60 border border-white/10 px-2 py-0.5 rounded-full">
                          Član
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {!isSelf && !isAdmin && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setPendingAction({ type: "transfer", member: m })
                              }
                            >
                              <ShieldCheck
                                className="w-4 h-4"
                                aria-hidden="true"
                              />
                              Postavi za admina
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setPendingAction({ type: "remove", member: m })
                              }
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <UserMinus
                                className="w-4 h-4"
                                aria-hidden="true"
                              />
                              Ukloni
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* d) Danger zone */}
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-red-400">Obriši klub</h3>
          <p className="text-sm text-white/50 mt-0.5">
            Svi članovi gube članstvo. Ova akcija je trajna.
          </p>
        </div>
        <Button
          variant="danger"
          onClick={() => setDeleteOpen(true)}
          className="flex-shrink-0"
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
          Obriši klub
        </Button>
      </div>

      <ConfirmModal
        isOpen={pendingAction !== null}
        onClose={() => setPendingAction(null)}
        onConfirm={confirmMemberAction}
        title={
          pendingAction?.type === "transfer"
            ? "Transfer admin uloge"
            : "Ukloni člana"
        }
        message={
          pendingAction?.type === "transfer" ? (
            <>
              Postavljanjem{" "}
              <span className="text-white font-medium">
                {pendingAction.member.firstName} {pendingAction.member.lastName}
              </span>{" "}
              za administratora, vi postajete običan član kluba. Nastaviti?
            </>
          ) : pendingAction?.type === "remove" ? (
            <>
              Ukloniti{" "}
              <span className="text-white font-medium">
                {pendingAction.member.firstName} {pendingAction.member.lastName}
              </span>{" "}
              iz kluba?
            </>
          ) : (
            ""
          )
        }
        confirmLabel={
          pendingAction?.type === "transfer"
            ? "Prebaci admin ulogu"
            : "Ukloni iz kluba"
        }
        variant={pendingAction?.type === "remove" ? "danger" : "default"}
      />

      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteClub}
        title="Obriši klub"
        message={
          <>
            Brisanjem kluba{" "}
            <span className="text-white font-medium">{club.name}</span> svi
            članovi gube članstvo. Za potvrdu ukucajte naziv kluba ispod.
          </>
        }
        confirmLabel="Trajno obriši klub"
        variant="danger"
        confirmationText={club.name}
        confirmationLabel="Naziv kluba"
      />
    </div>
  );
}

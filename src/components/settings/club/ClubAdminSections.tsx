"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Camera, Crown, ShieldOff, ShieldCheck, Trash2, UserMinus } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { readImageFile } from "@/lib/settings/image-upload";
import {
  approveJoinRequest,
  demoteFromAdmin,
  promoteToAdmin,
  rejectJoinRequest,
  removeClubMember,
  updateClubInfo,
  uploadClubLogo,
} from "@/app/actions/clubs";
import type {
  ClubMemberRow,
  ClubRow,
  JoinRequestRow,
} from "@/app/actions/club-types";

interface ClubAdminSectionsProps {
  club: ClubRow;
  members: ClubMemberRow[];
  joinRequests: JoinRequestRow[];
  currentUserId: string;
  blockLeave: boolean;
  onLeaveClick: () => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("sr-RS");
}

type PendingMemberAction =
  | { type: "remove"; member: ClubMemberRow }
  | { type: "promote"; member: ClubMemberRow }
  | { type: "demote"; member: ClubMemberRow }
  | null;

export function ClubAdminSections({
  club,
  members,
  joinRequests,
  currentUserId,
  blockLeave,
  onLeaveClick,
}: ClubAdminSectionsProps) {
  const router = useRouter();
  const [actionPending, startActionTransition] = useTransition();
  const [savingInfo, startSaveTransition] = useTransition();

  const [name, setName] = useState(club.name);
  const [city, setCity] = useState(club.city);
  const [logo, setLogo] = useState<string | null>(club.logo_url);
  const [logoChanged, setLogoChanged] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingAction, setPendingAction] = useState<PendingMemberAction>(null);

  const dirty =
    name.trim() !== club.name ||
    city.trim() !== club.city ||
    logoChanged;
  const canSave =
    dirty && name.trim().length > 0 && city.trim().length > 0 && !savingInfo;

  function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file)
      readImageFile(file, (dataUrl) => {
        setLogo(dataUrl);
        setLogoChanged(true);
      });
  }

  function removeLogo() {
    setLogo(null);
    setLogoChanged(true);
  }

  function handleSaveInfo() {
    if (!canSave) return;
    startSaveTransition(async () => {
      let logoUrl: string | null = club.logo_url;
      if (logoChanged) {
        if (logo && logo.startsWith("data:")) {
          const upload = await uploadClubLogo(club.id, logo);
          if (!upload.success) {
            toast.error(upload.error);
            return;
          }
          logoUrl = upload.data.url;
        } else {
          logoUrl = logo;
        }
      }
      const result = await updateClubInfo(club.id, {
        name: name.trim(),
        city: city.trim(),
        logoUrl,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setLogoChanged(false);
      toast.success("Podaci o društvu sačuvani");
      router.refresh();
    });
  }

  function handleApprove(reqId: string, fullName: string) {
    startActionTransition(async () => {
      const result = await approveJoinRequest(reqId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(`${fullName} je sada član društva`);
      router.refresh();
    });
  }

  function handleReject(reqId: string) {
    startActionTransition(async () => {
      const result = await rejectJoinRequest(reqId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Zahtev odbijen");
      router.refresh();
    });
  }

  function confirmMemberAction() {
    if (!pendingAction) return;
    const { type, member } = pendingAction;
    const name = `${member.profile.first_name} ${member.profile.last_name}`;
    startActionTransition(async () => {
      const result =
        type === "remove"
          ? await removeClubMember(member.id)
          : type === "promote"
            ? await promoteToAdmin(member.id)
            : await demoteFromAdmin(member.id);
      if (!result.success) {
        toast.error(result.error);
        setPendingAction(null);
        return;
      }
      const msg =
        type === "remove"
          ? `${name} je uklonjen iz društva`
          : type === "promote"
            ? `${name} je sada admin društva`
            : `${name} više nije admin`;
      toast.success(msg);
      setPendingAction(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* a) Editable club data */}
      <div className="card-redesign p-6 space-y-5 max-w-2xl">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-text-primary font-rajdhani">
            Podaci o društvu
          </h2>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveInfo}
            disabled={!canSave}
            loading={savingInfo}
          >
            Sačuvaj izmene
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label="Promeni logo društva"
            className="rounded-full focus:outline-none focus:ring-2 focus:ring-accent/40 group relative"
          >
            <Avatar src={logo} name={name || "K"} size="lg" />
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
              {logo && (
                <Button variant="ghost" size="sm" onClick={removeLogo}>
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                  Ukloni
                </Button>
              )}
            </div>
            <p className="text-sm text-text-disabled">JPG ili PNG, do 2MB.</p>
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
          label="Naziv društva"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={name.trim() === "" ? "Obavezno polje." : undefined}
        />
        <Input
          label="Lokacija (grad)"
          required
          value={city}
          onChange={(e) => setCity(e.target.value)}
          error={city.trim() === "" ? "Obavezno polje." : undefined}
        />
      </div>

      {/* b) Join requests */}
      {joinRequests.length > 0 && (
        <div className="card-redesign max-w-2xl">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <h2 className="text-lg font-semibold text-text-primary font-rajdhani">
              Zahtevi za članstvo
            </h2>
            <span className="bg-accent-light text-accent rounded-full px-2 py-0.5 text-xs font-medium">
              {joinRequests.length}
            </span>
          </div>
          <ul className="divide-y divide-border">
            {joinRequests.map((req) => {
              const fullName = `${req.profile.first_name} ${req.profile.last_name}`;
              return (
                <li key={req.id} className="px-6 py-3 flex items-center gap-3">
                  <Avatar
                    src={req.profile.avatar_url}
                    name={req.profile.first_name}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-text-primary font-medium truncate">{fullName}</p>
                    <p className="text-sm text-text-tertiary truncate">
                      @{req.profile.username} · {formatDate(req.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApprove(req.id, fullName)}
                      disabled={actionPending}
                    >
                      Prihvati
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleReject(req.id)}
                      disabled={actionPending}
                    >
                      Odbij
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* c) Members */}
      <div className="card-redesign">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <h2 className="text-lg font-semibold text-text-primary font-rajdhani">
            Članovi društva
          </h2>
          <span className="bg-bg-hover text-text-tertiary rounded-full px-2 py-0.5 text-sm">
            {members.length}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="table-header-gradient">
                <th className="px-6 py-3 text-left text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Član
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Korisničko ime
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Pridružen
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Uloga
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Akcije
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const isSelf = m.user_id === currentUserId;
                const isAdmin = m.role === "admin";
                return (
                  <tr key={m.id} className="border-t border-border">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          src={m.profile.avatar_url}
                          name={m.profile.first_name}
                          size="sm"
                        />
                        <span className="text-text-primary">
                          {m.profile.first_name} {m.profile.last_name}
                          {isSelf && (
                            <span className="text-text-disabled"> (Vi)</span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-text-tertiary">
                      @{m.profile.username}
                    </td>
                    <td className="px-6 py-3 text-text-tertiary">
                      {formatDate(m.joined_at)}
                    </td>
                    <td className="px-6 py-3">
                      {isAdmin ? (
                        <span className="inline-flex items-center gap-1 text-sm bg-accent-light text-accent border border-accent/30 px-2 py-0.5 rounded-full">
                          <Crown className="w-3 h-3" aria-hidden="true" />
                          Admin
                        </span>
                      ) : (
                        <span className="text-sm bg-bg-hover text-text-tertiary border border-border px-2 py-0.5 rounded-full">
                          Član
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {!isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setPendingAction({ type: "promote", member: m })
                            }
                            disabled={actionPending}
                          >
                            <ShieldCheck
                              className="w-4 h-4"
                              aria-hidden="true"
                            />
                            Promoviši u admina
                          </Button>
                        )}
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setPendingAction({ type: "demote", member: m })
                            }
                            disabled={actionPending || blockLeave && isSelf}
                            title={
                              blockLeave && isSelf
                                ? "Promovišite drugog člana pre nego što sebi skinete ulogu"
                                : undefined
                            }
                          >
                            <ShieldOff
                              className="w-4 h-4"
                              aria-hidden="true"
                            />
                            Skini admin ulogu
                          </Button>
                        )}
                        {!isSelf && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setPendingAction({ type: "remove", member: m })
                            }
                            disabled={actionPending}
                            className="text-status-error hover:text-status-error hover:bg-bg-error-light"
                          >
                            <UserMinus
                              className="w-4 h-4"
                              aria-hidden="true"
                            />
                            Ukloni
                          </Button>
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

      {/* d) Leave club */}
      <div className="rounded-xl border border-status-error bg-bg-error-light p-6 flex items-center justify-between gap-4 max-lg:flex-col max-lg:items-stretch max-lg:gap-3 max-lg:p-4">
        <div>
          <h3 className="text-base font-semibold text-status-error">Napusti društvo</h3>
          <p className="text-sm text-text-tertiary mt-0.5 max-lg:text-xs">
            {blockLeave
              ? "Prvo promovišite drugog člana u admina pre nego što napustite društvo."
              : "Vaši letovi i golubovi ostaju, ali nećete više pripadati društvu."}
          </p>
        </div>
        <Button
          variant="danger"
          onClick={onLeaveClick}
          disabled={blockLeave}
          title={
            blockLeave
              ? "Prvo promovišite drugog člana u admina"
              : undefined
          }
          className="flex-shrink-0 max-lg:w-full max-lg:!py-2 max-lg:!text-sm"
        >
          Napusti društvo
        </Button>
      </div>

      <ConfirmModal
        isOpen={pendingAction !== null}
        onClose={() => setPendingAction(null)}
        onConfirm={confirmMemberAction}
        title={
          pendingAction?.type === "promote"
            ? "Promoviši u admina"
            : pendingAction?.type === "demote"
              ? "Skini admin ulogu"
              : "Ukloni člana"
        }
        message={
          pendingAction?.type === "promote" ? (
            <>
              Promovisati{" "}
              <span className="text-text-primary font-medium">
                {pendingAction.member.profile.first_name}{" "}
                {pendingAction.member.profile.last_name}
              </span>{" "}
              u administratora društva?
            </>
          ) : pendingAction?.type === "demote" ? (
            <>
              Skinuti admin ulogu sa{" "}
              <span className="text-text-primary font-medium">
                {pendingAction.member.profile.first_name}{" "}
                {pendingAction.member.profile.last_name}
              </span>
              ? Postaće običan član.
            </>
          ) : pendingAction?.type === "remove" ? (
            <>
              Ukloniti{" "}
              <span className="text-text-primary font-medium">
                {pendingAction.member.profile.first_name}{" "}
                {pendingAction.member.profile.last_name}
              </span>{" "}
              iz društva?
            </>
          ) : (
            ""
          )
        }
        confirmLabel={
          pendingAction?.type === "promote"
            ? "Promoviši"
            : pendingAction?.type === "demote"
              ? "Skini ulogu"
              : "Ukloni iz društva"
        }
        variant={pendingAction?.type === "remove" ? "danger" : "default"}
        loading={actionPending}
      />
    </div>
  );
}

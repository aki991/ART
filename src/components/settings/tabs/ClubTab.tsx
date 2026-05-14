"use client";

import { toast } from "sonner";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSettingsStore } from "@/lib/store/settings-store";
import type { Club, ClubEditableData } from "@/lib/settings/types";
import { ClubBrowser } from "../club/ClubBrowser";
import { ClubInfoCard } from "../club/ClubInfoCard";
import { ClubAdminSections } from "../club/ClubAdminSections";

interface ClubTabProps {
  clubDraft: ClubEditableData | null;
  onClubDraftChange: (next: ClubEditableData) => void;
}

function clubEditableOf(club: Club): ClubEditableData {
  return {
    name: club.name,
    city: club.city,
    description: club.description,
    logo: club.logo,
  };
}

export function ClubTab({ clubDraft, onClubDraftChange }: ClubTabProps) {
  const membership = useSettingsStore((s) => s.membership);
  const clubs = useSettingsStore((s) => s.clubs);
  const cancelJoinRequest = useSettingsStore((s) => s.cancelJoinRequest);

  const club = membership.clubId
    ? clubs.find((c) => c.id === membership.clubId) ?? null
    : null;

  // A) Not a member of any club.
  if (membership.status === "none") {
    return <ClubBrowser />;
  }

  // B) Join request pending approval.
  if (membership.status === "pending") {
    return (
      <div className="card-redesign p-6 max-w-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-amber-400" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white font-rajdhani">
              Zahtev na čekanju
            </h2>
            <p className="text-sm text-white/60 mt-0.5">
              Zahtev za pridruživanje klubu{" "}
              <span className="text-white font-medium">
                {club?.name ?? "—"}
              </span>{" "}
              čeka odobrenje.
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            cancelJoinRequest();
            toast.success("Zahtev otkazan");
          }}
        >
          Otkaži zahtev
        </Button>
      </div>
    );
  }

  // Membership references a club that no longer exists — recover gracefully.
  if (!club) {
    return <ClubBrowser />;
  }

  // C) Regular member.
  if (membership.status === "member") {
    return <ClubInfoCard club={club} />;
  }

  // D) Club administrator.
  return (
    <ClubAdminSections
      club={club}
      clubDraft={clubDraft ?? clubEditableOf(club)}
      onClubDraftChange={onClubDraftChange}
    />
  );
}

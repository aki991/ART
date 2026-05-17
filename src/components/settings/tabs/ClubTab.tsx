"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Clock, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import {
  cancelClubCreationRequest,
  cancelJoinRequest,
  leaveClub,
} from "@/app/actions/clubs";
import type {
  ClubCreationRequestRow,
  ClubMemberRow,
  ClubRow,
  JoinRequestRow,
  MembershipSnapshot,
} from "@/app/actions/club-types";
import { ClubBrowser } from "../club/ClubBrowser";
import { ClubInfoCard } from "../club/ClubInfoCard";
import { ClubAdminSections } from "../club/ClubAdminSections";
import { CreateClubRequestModal } from "../modals/CreateClubRequestModal";

interface ClubTabProps {
  membership: MembershipSnapshot | null;
  pendingJoinRequest: (JoinRequestRow & { club: ClubRow }) | null;
  creationRequest: ClubCreationRequestRow | null;
  initialClubs: ClubRow[];
  members: ClubMemberRow[];
  joinRequests: JoinRequestRow[];
}

export function ClubTab({
  membership,
  pendingJoinRequest,
  creationRequest,
  initialClubs,
  members,
  joinRequests,
}: ClubTabProps) {
  const router = useRouter();
  const user = useCurrentUser();
  const [pending, startTransition] = useTransition();
  const [retryOpen, setRetryOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  // ─── State C/D: in a club ───────────────────────────
  if (membership) {
    const isAdmin = membership.role === "admin";
    const adminCount = members.filter((m) => m.role === "admin").length;
    const blockLeave = isAdmin && adminCount <= 1;

    function handleLeave() {
      startTransition(async () => {
        const result = await leaveClub();
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        setLeaveOpen(false);
        toast.success("Napustili ste društvo");
        router.refresh();
      });
    }

    return (
      <>
        {isAdmin ? (
          <ClubAdminSections
            club={membership.club}
            members={members}
            joinRequests={joinRequests}
            currentUserId={user.id}
            blockLeave={blockLeave}
            onLeaveClick={() => setLeaveOpen(true)}
          />
        ) : (
          <ClubInfoCard
            club={membership.club}
            members={members}
            joinedAt={membership.joinedAt}
            blockLeave={false}
          />
        )}
        <ConfirmModal
          isOpen={leaveOpen}
          onClose={() => setLeaveOpen(false)}
          onConfirm={handleLeave}
          title="Napusti društvo"
          message={
            <>
              Da li ste sigurni da želite da napustite društvo{" "}
              <span className="text-text-primary font-medium">{membership.club.name}</span>?
            </>
          }
          confirmLabel="Napusti društvo"
          variant="danger"
          loading={pending}
        />
      </>
    );
  }

  // ─── State B: pending join request ──────────────────
  if (pendingJoinRequest) {
    function handleCancel() {
      startTransition(async () => {
        const result = await cancelJoinRequest(pendingJoinRequest!.id);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success("Zahtev otkazan");
        router.refresh();
      });
    }
    return (
      <div className="card-redesign p-6 max-w-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-bg-warning-light border border-status-warning/30 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-status-warning" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary font-rajdhani">
              Zahtev na čekanju
            </h2>
            <p className="text-sm text-text-tertiary mt-0.5">
              Zahtev za pridruživanje društvu{" "}
              <span className="text-text-primary font-medium">
                {pendingJoinRequest.club.name}
              </span>{" "}
              čeka odobrenje.
            </p>
          </div>
        </div>
        <Button variant="secondary" onClick={handleCancel} disabled={pending}>
          Otkaži zahtev
        </Button>
      </div>
    );
  }

  // ─── State B2/B3: club creation request ─────────────
  if (creationRequest) {
    function handleCancelCreation() {
      startTransition(async () => {
        const result = await cancelClubCreationRequest();
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success("Zahtev otkazan");
        router.refresh();
      });
    }

    if (creationRequest.status === "pending") {
      return (
        <div className="card-redesign p-6 max-w-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-bg-warning-light border border-status-warning/30 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-status-warning" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary font-rajdhani">
                Zahtev za kreiranje društva na čekanju
              </h2>
              <p className="text-sm text-text-tertiary mt-0.5">
                Vaš zahtev za kreiranje društva{" "}
                <span className="text-text-primary font-medium">
                  &quot;{creationRequest.proposed_name}&quot;
                </span>{" "}
                čeka odobrenje Super Admina.
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={handleCancelCreation}
            disabled={pending}
          >
            Otkaži zahtev
          </Button>
        </div>
      );
    }

    // rejected
    return (
      <>
        <div className="rounded-xl border border-status-error bg-bg-error-light p-6 max-w-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-bg-error-light border border-status-error/30 flex items-center justify-center flex-shrink-0">
              <TriangleAlert
                className="w-5 h-5 text-status-error"
                aria-hidden="true"
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-status-error font-rajdhani">
                Zahtev odbijen
              </h2>
              <p className="text-sm text-text-tertiary mt-0.5">
                Vaš zahtev za kreiranje društva{" "}
                <span className="text-text-primary font-medium">
                  &quot;{creationRequest.proposed_name}&quot;
                </span>{" "}
                je odbijen.
              </p>
            </div>
          </div>
          {creationRequest.rejection_reason && (
            <div className="rounded-md bg-bg-hover border border-border p-3">
              <p className="text-xs uppercase tracking-wide text-text-disabled mb-1">
                Razlog
              </p>
              <p className="text-sm text-text-secondary">
                {creationRequest.rejection_reason}
              </p>
            </div>
          )}
          <Button variant="secondary" onClick={() => setRetryOpen(true)}>
            Pošalji novi zahtev
          </Button>
        </div>
        <CreateClubRequestModal
          isOpen={retryOpen}
          onClose={() => setRetryOpen(false)}
        />
      </>
    );
  }

  // ─── State A: nothing — show browser ────────────────
  return <ClubBrowser clubs={initialClubs} />;
}

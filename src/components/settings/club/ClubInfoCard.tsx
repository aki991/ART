"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Calendar, LogOut, MapPin, ShieldCheck, Users } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { leaveClub } from "@/app/actions/clubs";
import type { ClubMemberRow, ClubRow } from "@/app/actions/club-types";

interface ClubInfoCardProps {
  club: ClubRow;
  members: ClubMemberRow[];
  joinedAt: string;
  blockLeave?: boolean;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("sr-RS");
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-accent/60 mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-text-disabled">{label}</p>
        <p className="text-base text-text-secondary">{value}</p>
      </div>
    </div>
  );
}

export function ClubInfoCard({
  club,
  members,
  joinedAt,
  blockLeave = false,
}: ClubInfoCardProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [leaveOpen, setLeaveOpen] = useState(false);

  const admins = members.filter((m) => m.role === "admin");
  const adminsLabel =
    admins.length === 0
      ? "—"
      : admins
          .map(
            (a) =>
              `${a.profile.first_name} ${a.profile.last_name} · @${a.profile.username}`
          )
          .join(", ");

  function handleLeave() {
    startTransition(async () => {
      const result = await leaveClub();
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setLeaveOpen(false);
      toast.success("Napustili ste klub");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="card-redesign p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar src={club.logo_url} name={club.name} size="lg" />
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-text-primary font-rajdhani truncate">
              {club.name}
            </h2>
            <p className="text-sm text-text-tertiary">Vaš klub</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <InfoRow
            icon={<MapPin className="w-4 h-4" aria-hidden="true" />}
            label="Lokacija"
            value={club.city}
          />
          <InfoRow
            icon={<Users className="w-4 h-4" aria-hidden="true" />}
            label="Broj članova"
            value={String(members.length)}
          />
          <InfoRow
            icon={<ShieldCheck className="w-4 h-4" aria-hidden="true" />}
            label={admins.length > 1 ? "Admini kluba" : "Admin kluba"}
            value={adminsLabel}
          />
          <InfoRow
            icon={<Calendar className="w-4 h-4" aria-hidden="true" />}
            label="Datum pridruživanja"
            value={formatDate(joinedAt)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-status-error bg-bg-error-light p-6 flex items-center justify-between gap-4 max-lg:flex-col max-lg:items-stretch max-lg:gap-3 max-lg:p-4">
        <div>
          <h3 className="text-base font-semibold text-status-error">Napusti klub</h3>
          <p className="text-sm text-text-tertiary mt-0.5 max-lg:text-xs">
            {blockLeave
              ? "Prvo promovišite drugog člana u admina pre nego što napustite klub."
              : "Vaše trke i golubovi ostaju, ali nećete više pripadati klubu."}
          </p>
        </div>
        <Button
          variant="danger"
          onClick={() => setLeaveOpen(true)}
          disabled={blockLeave || pending}
          title={
            blockLeave
              ? "Prvo promovišite drugog člana u admina"
              : undefined
          }
          className="flex-shrink-0 max-lg:w-full max-lg:!py-2 max-lg:!text-sm"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          Napusti klub
        </Button>
      </div>

      <ConfirmModal
        isOpen={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        onConfirm={handleLeave}
        title="Napusti klub"
        message={
          <>
            Da li ste sigurni da želite da napustite klub? Vaše trke i golubovi
            ostaju, ali nećete više pripadati klubu{" "}
            <span className="text-text-primary font-medium">{club.name}</span>.
          </>
        }
        confirmLabel="Napusti klub"
        variant="danger"
        loading={pending}
      />
    </div>
  );
}

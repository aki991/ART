"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Check, Eye, Inbox, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import {
  approveClubCreation,
  rejectClubCreation,
} from "@/app/actions/clubs";
import type { ClubCreationRequestRow } from "@/app/actions/club-types";
import { cn } from "@/lib/utils";

type Status = "pending" | "approved" | "rejected";

const STATUS_TABS: { id: Status; label: string }[] = [
  { id: "pending", label: "Na čekanju" },
  { id: "approved", label: "Odobreni" },
  { id: "rejected", label: "Odbijeni" },
];

interface SuperAdminClubRequestsClientProps {
  activeStatus: Status;
  requests: ClubCreationRequestRow[];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("sr-RS", { dateStyle: "medium", timeStyle: "short" });
}

export function SuperAdminClubRequestsClient({
  activeStatus,
  requests,
}: SuperAdminClubRequestsClientProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [viewing, setViewing] = useState<ClubCreationRequestRow | null>(null);
  const [approving, setApproving] = useState<ClubCreationRequestRow | null>(
    null
  );
  const [rejecting, setRejecting] = useState<ClubCreationRequestRow | null>(
    null
  );
  const [rejectReason, setRejectReason] = useState("");

  function handleApprove() {
    if (!approving) return;
    startTransition(async () => {
      const result = await approveClubCreation(approving.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(`Klub "${approving.proposed_name}" je osnovan.`);
      setApproving(null);
      router.refresh();
    });
  }

  function handleReject() {
    if (!rejecting) return;
    if (!rejectReason.trim()) {
      toast.error("Razlog odbijanja je obavezan.");
      return;
    }
    startTransition(async () => {
      const result = await rejectClubCreation(rejecting.id, rejectReason.trim());
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Zahtev odbijen");
      setRejecting(null);
      setRejectReason("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-border">
        {STATUS_TABS.map((tab) => {
          const isActive = activeStatus === tab.id;
          return (
            <Link
              key={tab.id}
              href={`/super-admin/club-requests?status=${tab.id}`}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px",
                isActive
                  ? "border-accent text-accent"
                  : "border-transparent text-text-tertiary hover:text-text-primary"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {requests.length === 0 ? (
        <div className="card-redesign p-10 flex flex-col items-center text-center gap-3">
          <Inbox className="w-10 h-10 text-text-disabled" aria-hidden="true" />
          <p className="text-text-tertiary">Nema zahteva u ovoj kategoriji.</p>
        </div>
      ) : (
        <div className="card-redesign overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header-gradient">
                  <th className="px-6 py-3 text-left font-medium text-text-tertiary uppercase tracking-wider">
                    Logo
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-text-tertiary uppercase tracking-wider">
                    Predloženo ime
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-text-tertiary uppercase tracking-wider">
                    Grad
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-text-tertiary uppercase tracking-wider">
                    Podneo
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-text-tertiary uppercase tracking-wider">
                    Datum
                  </th>
                  <th className="px-6 py-3 text-right font-medium text-text-tertiary uppercase tracking-wider">
                    Akcije
                  </th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="border-t border-border">
                    <td className="px-6 py-3">
                      <Avatar
                        src={req.proposed_logo_url}
                        name={req.proposed_name}
                        size="sm"
                      />
                    </td>
                    <td className="px-6 py-3 text-text-primary font-medium">
                      {req.proposed_name}
                    </td>
                    <td className="px-6 py-3 text-text-secondary">
                      {req.proposed_city}
                    </td>
                    <td className="px-6 py-3 text-text-tertiary">
                      {req.requester
                        ? `${req.requester.first_name} ${req.requester.last_name} · @${req.requester.username}`
                        : "—"}
                    </td>
                    <td className="px-6 py-3 text-text-tertiary">
                      {formatDate(req.created_at)}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewing(req)}
                        >
                          <Eye className="w-4 h-4" aria-hidden="true" />
                          Pregled
                        </Button>
                        {req.status === "pending" && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => setApproving(req)}
                            >
                              <Check className="w-4 h-4" aria-hidden="true" />
                              Odobri
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setRejecting(req)}
                              className="text-status-error hover:text-status-error hover:bg-bg-error-light"
                            >
                              <X className="w-4 h-4" aria-hidden="true" />
                              Odbij
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail modal */}
      <Modal
        isOpen={viewing !== null}
        onClose={() => setViewing(null)}
        title="Detalji zahteva"
        footer={
          <Button variant="secondary" onClick={() => setViewing(null)}>
            Zatvori
          </Button>
        }
      >
        {viewing && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar
                src={viewing.proposed_logo_url}
                name={viewing.proposed_name}
                size="lg"
              />
              <div>
                <h3 className="text-lg font-semibold text-text-primary font-rajdhani">
                  {viewing.proposed_name}
                </h3>
                <p className="text-sm text-text-tertiary">{viewing.proposed_city}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs uppercase tracking-wide text-text-disabled">
                  Podneo
                </p>
                <p className="text-sm text-text-secondary">
                  {viewing.requester
                    ? `${viewing.requester.first_name} ${viewing.requester.last_name}`
                    : "—"}
                </p>
                {viewing.requester && (
                  <p className="text-xs text-text-tertiary font-mono">
                    @{viewing.requester.username}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-text-disabled">
                  Datum
                </p>
                <p className="text-sm text-text-secondary">
                  {formatDate(viewing.created_at)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-text-disabled">
                  Status
                </p>
                <p className="text-sm text-text-secondary">{viewing.status}</p>
              </div>
              {viewing.resolved_at && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-text-disabled">
                    Rešen
                  </p>
                  <p className="text-sm text-text-secondary">
                    {formatDate(viewing.resolved_at)}
                  </p>
                </div>
              )}
            </div>
            {viewing.rejection_reason && (
              <div className="rounded-md bg-bg-error-light border border-status-error/30 p-3">
                <p className="text-xs uppercase tracking-wide text-status-error mb-1">
                  Razlog odbijanja
                </p>
                <p className="text-sm text-text-secondary">
                  {viewing.rejection_reason}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Approve confirmation */}
      <ConfirmModal
        isOpen={approving !== null}
        onClose={() => setApproving(null)}
        onConfirm={handleApprove}
        title="Odobri zahtev"
        message={
          approving ? (
            <>
              Odobravanjem zahteva kreira se klub{" "}
              <span className="text-text-primary font-medium">
                &quot;{approving.proposed_name}&quot;
              </span>
              , a{" "}
              <span className="text-text-primary font-medium">
                {approving.requester?.first_name} {approving.requester?.last_name}
              </span>{" "}
              postaje njegov admin.
            </>
          ) : null
        }
        confirmLabel="Odobri i osnuj klub"
        loading={pending}
      />

      {/* Reject modal */}
      <Modal
        isOpen={rejecting !== null}
        onClose={() => {
          setRejecting(null);
          setRejectReason("");
        }}
        title="Odbij zahtev"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setRejecting(null);
                setRejectReason("");
              }}
              disabled={pending}
            >
              Odustani
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              loading={pending}
              disabled={!rejectReason.trim()}
            >
              Odbij zahtev
            </Button>
          </>
        }
      >
        {rejecting && (
          <div className="space-y-3">
            <p className="text-sm text-text-secondary">
              Unesite razlog odbijanja zahteva za klub{" "}
              <span className="text-text-primary font-medium">
                &quot;{rejecting.proposed_name}&quot;
              </span>
              . Razlog se prikazuje korisniku.
            </p>
            <Textarea
              label="Razlog"
              required
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="npr. Klub sa sličnim imenom već postoji u istom gradu."
              rows={4}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

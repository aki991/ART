"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X, Trophy, Pencil, Trash2, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPigeonRaceHistory } from "@/app/actions/races";
import type { Pigeon } from "@/lib/types/pigeon";
import type { PigeonRaceHistoryItem } from "@/lib/types/race";

interface PigeonHistoryModalProps {
  pigeon: Pigeon | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const VIS_THRESHOLD_M = 800;

function formatTimeShort(totalSeconds: number | null): string {
  if (totalSeconds == null || totalSeconds <= 0) return "—";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function PigeonHistoryModal({
  pigeon,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: PigeonHistoryModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [history, setHistory] = useState<PigeonRaceHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setMounted(false);
      return;
    }
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !pigeon) {
      setHistory([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void getPigeonRaceHistory(pigeon.id).then((res) => {
      if (cancelled) return;
      setLoading(false);
      if (res.success) setHistory(res.data);
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen, pigeon]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !pigeon) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pigeon-details-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
    >
      <div
        className={cn(
          "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200",
          mounted ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          "relative bg-bg-surface-elevated rounded-xl shadow-lg border border-border max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col transition-all duration-200",
          mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}
      >
        <div className="flex items-start justify-between px-8 py-5 border-b border-border">
          <div className="min-w-0">
            <div
              id="pigeon-details-title"
              className="text-2xl font-bold text-text-primary mb-1 truncate"
            >
              {pigeon.full_ring_number}
            </div>
            <div className="text-base text-text-tertiary">
              {pigeon.color || "—"}
              {pigeon.name && (
                <span className="text-text-secondary"> · {pigeon.name}</span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zatvori"
            className="text-text-disabled hover:text-text-primary transition-colors flex-shrink-0"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-bg-surface border border-border rounded-md px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-text-tertiary mb-1">
                Dodat
              </div>
              <div className="text-base text-text-primary font-medium">
                {formatDate(pigeon.created_at)}
              </div>
            </div>
            <div className="bg-bg-surface border border-border rounded-md px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-text-tertiary mb-1">
                Poslednja izmena
              </div>
              <div className="text-base text-text-primary font-medium">
                {formatDate(pigeon.updated_at)}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Istorija letova</h3>
            <p className="text-sm text-text-tertiary">
              {loading
                ? "Učitavanje istorije..."
                : history.length === 0
                  ? "Ovaj golub još nije učestvovao u letovima."
                  : `Učestvovao u ${history.length} ${history.length === 1 ? "letu" : "letova"}.`}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-text-tertiary" aria-hidden="true" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 bg-bg-surface border border-dashed border-border rounded-xl">
              <Trophy className="w-16 h-16 text-text-disabled mx-auto mb-4" aria-hidden="true" />
              <p className="text-text-secondary mb-1">
                Ovaj golub još nije učestvovao u letovima.
              </p>
              <p className="text-sm text-text-tertiary">
                Programiraj prsten ovom golubu i pokreni let.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border">
              <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="table-header-gradient text-xs uppercase text-text-tertiary font-medium">
                  <tr>
                    <th className="text-left py-3 px-4">Datum</th>
                    <th className="text-left py-3 px-4">Vrsta takmičenja</th>
                    <th className="text-left py-3 px-4">Ukupno vreme</th>
                    <th className="text-left py-3 px-4">Vreme iznad {VIS_THRESHOLD_M}m</th>
                    <th className="text-left py-3 px-4">Max visina</th>
                    <th className="text-left py-3 px-4">Postigao VIS</th>
                    <th className="text-left py-3 px-4">Validan let</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr
                      key={item.race_pigeon_id}
                      onClick={() => {
                        onClose();
                        router.push(`/races/${item.race_id}`);
                      }}
                      className="border-t border-border hover:bg-bg-hover cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-4 text-text-tertiary text-sm whitespace-nowrap">
                        {formatDate(item.started_at)}
                      </td>
                      <td className="py-4 px-4 text-text-primary font-medium whitespace-nowrap">
                        {item.race_name}
                      </td>
                      <td className="py-4 px-4 text-text-secondary whitespace-nowrap">
                        {formatTimeShort(item.total_time_sec)}
                      </td>
                      <td className="py-4 px-4 text-text-secondary whitespace-nowrap">
                        {item.total_time_sec > 0 ? (
                          <>
                            {formatTimeShort(item.above_vis_sec)}
                            <span className="text-text-tertiary ml-1">
                              ({item.above_vis_pct.toFixed(0)}%)
                            </span>
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-4 px-4 text-accent font-semibold whitespace-nowrap">
                        {item.max_altitude != null ? `${item.max_altitude}m` : "—"}
                      </td>
                      <td className="py-4 px-4">
                        {item.reached_vis ? (
                          <div className="flex items-center gap-2 text-status-success">
                            <Check className="w-5 h-5" aria-hidden="true" />
                            <span className="text-sm font-medium">Da</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-status-error">
                            <X className="w-5 h-5" aria-hidden="true" />
                            <span className="text-sm font-medium">Ne</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {item.valid_flight ? (
                          <div className="flex items-center gap-2 text-status-success">
                            <Check className="w-5 h-5" aria-hidden="true" />
                            <span className="text-sm font-medium">Da</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-status-error">
                            <X className="w-5 h-5" aria-hidden="true" />
                            <span className="text-sm font-medium">Ne</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </div>

        <div className="px-8 py-5 border-t border-border flex items-center justify-between gap-3">
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-base font-medium bg-bg-error-light border border-status-error/40 text-status-error hover:bg-status-error/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
              Obriši
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-md text-base font-medium bg-bg-input border border-border text-text-secondary hover:bg-bg-hover transition-colors"
            >
              Zatvori
            </button>
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-base font-bold bg-accent text-text-on-accent hover:bg-accent-hover transition-colors"
              >
                <Pencil className="w-4 h-4" aria-hidden="true" />
                Izmeni
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

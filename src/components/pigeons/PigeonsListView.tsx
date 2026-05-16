"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Bird } from "lucide-react";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { deletePigeon, getMyPigeons } from "@/app/actions/pigeons";
import type { Pigeon } from "@/lib/types/pigeon";
import { PigeonCard } from "./PigeonCard";
import { PigeonModal } from "./PigeonModal";
import { PigeonHistoryModal } from "./PigeonHistoryModal";

interface PigeonsListViewProps {
  initialPigeons: Pigeon[];
}

export function PigeonsListView({ initialPigeons }: PigeonsListViewProps) {
  const router = useRouter();
  const [pigeons, setPigeons] = useState<Pigeon[]>(initialPigeons);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPigeon, setEditingPigeon] = useState<Pigeon | null>(null);
  const [detailsPigeon, setDetailsPigeon] = useState<Pigeon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Pigeon | null>(null);
  const [, startTransition] = useTransition();
  const [deleting, setDeleting] = useState(false);

  async function refreshList() {
    const res = await getMyPigeons();
    if (res.success) setPigeons(res.data);
  }

  function openCreateModal() {
    setEditingPigeon(null);
    setIsFormOpen(true);
  }

  function openEditModal(pigeon: Pigeon) {
    setDetailsPigeon(null);
    setEditingPigeon(pigeon);
    setIsFormOpen(true);
  }

  function closeFormModal() {
    setIsFormOpen(false);
    setEditingPigeon(null);
  }

  function handleSaved(pigeon: Pigeon, mode: "create" | "update") {
    setPigeons((prev) => {
      if (mode === "create") return [pigeon, ...prev];
      return prev.map((p) => (p.id === pigeon.id ? pigeon : p));
    });
    closeFormModal();
    startTransition(() => router.refresh());
  }

  function requestDelete(pigeon: Pigeon) {
    setDeleteTarget(pigeon);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await deletePigeon(deleteTarget.id);
    setDeleting(false);
    if (!res.success) {
      toast.error("Brisanje neuspešno", { description: res.error });
      return;
    }
    setPigeons((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    setDeleteTarget(null);
    setDetailsPigeon(null);
    toast.success("Golub obrisan");
    startTransition(() => router.refresh());
  }

  return (
    <>
      <div className="flex items-center justify-end mb-6">
        <button
          type="button"
          onClick={openCreateModal}
          className="btn-shine-redesign inline-flex items-center gap-3 px-6 py-3 rounded-md text-lg font-bold bg-accent text-text-on-accent hover:bg-accent-hover transition-colors"
        >
          <Plus className="w-6 h-6" aria-hidden="true" />
          Dodaj goluba
        </button>
      </div>

      {pigeons.length === 0 ? (
        <div className="bg-bg-surface border-2 border-dashed border-border rounded-lg p-12 text-center">
          <Bird className="w-16 h-16 text-text-disabled mx-auto mb-4" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-text-primary">
            Niste još dodali nijednog goluba
          </h3>
          <p className="text-sm text-text-tertiary mt-2">
            Dodajte prvog goluba klikom na dugme iznad
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pigeons.map((pigeon) => (
            <PigeonCard
              key={pigeon.id}
              pigeon={pigeon}
              onOpen={() => setDetailsPigeon(pigeon)}
              onEdit={() => openEditModal(pigeon)}
              onDelete={() => requestDelete(pigeon)}
            />
          ))}
        </div>
      )}

      <PigeonModal
        isOpen={isFormOpen}
        onClose={closeFormModal}
        editingPigeon={editingPigeon}
        onSaved={handleSaved}
      />

      <PigeonHistoryModal
        pigeon={detailsPigeon}
        isOpen={detailsPigeon !== null}
        onClose={() => setDetailsPigeon(null)}
        onEdit={() => detailsPigeon && openEditModal(detailsPigeon)}
        onDelete={() => detailsPigeon && requestDelete(detailsPigeon)}
      />

      <ConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Obriši goluba"
        variant="danger"
        confirmLabel="Obriši"
        cancelLabel="Otkaži"
        loading={deleting}
        message={
          deleteTarget ? (
            <>
              Da li ste sigurni da želite da obrišete goluba{" "}
              <span className="font-mono font-semibold text-text-primary">
                {deleteTarget.full_ring_number}
              </span>
              ? Ova akcija se ne može opozvati.
            </>
          ) : null
        }
      />
    </>
  );
}

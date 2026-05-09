"use client";

import { useState } from "react";
import { Plus, Bird } from "lucide-react";
import { toast } from "sonner";
import { usePigeonsStore } from "@/lib/store/pigeons-store";
import type { Pigeon } from "@/lib/store/pigeons-store";
import { PigeonCard } from "./PigeonCard";
import { PigeonModal } from "./PigeonModal";

export function PigeonsListView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPigeon, setEditingPigeon] = useState<Pigeon | null>(null);

  const pigeons = usePigeonsStore((s) => s.pigeons);
  const removePigeon = usePigeonsStore((s) => s.removePigeon);
  const formatIdentifier = usePigeonsStore((s) => s.formatIdentifier);

  function openModal() {
    setEditingPigeon(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingPigeon(null);
  }

  function handleEdit(pigeon: Pigeon) {
    setEditingPigeon(pigeon);
    setIsModalOpen(true);
  }

  function handleDelete(id: string) {
    const pigeon = pigeons.find((p) => p.id === id);
    if (!pigeon) return;
    if (
      window.confirm(
        `Da li ste sigurni? Golub ${formatIdentifier(pigeon)} će biti obrisan.`
      )
    ) {
      removePigeon(id);
      toast.success("Golub obrisan");
    }
  }

  return (
    <>
      <div className="flex items-center justify-end mb-6">
        <button
          type="button"
          onClick={openModal}
          className="btn-shine-redesign inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium bg-cyan-brand text-white hover:bg-cyan-dark transition-colors"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Dodaj goluba
        </button>
      </div>

      {pigeons.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <Bird className="w-16 h-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-gray-900">
            Još nemate dodanih golubova
          </h3>
          <p className="text-sm text-gray-500 mt-2">
            Dodajte prvog goluba klikom na dugme iznad
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pigeons.map((pigeon) => (
            <PigeonCard
              key={pigeon.id}
              pigeon={pigeon}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <PigeonModal
        isOpen={isModalOpen}
        onClose={closeModal}
        editingPigeon={editingPigeon}
      />
    </>
  );
}

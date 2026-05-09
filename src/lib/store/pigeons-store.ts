import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Pigeon {
  id: string;
  pigeonColor: string;
  clubNumber: string;
  breederNumber: string;
  pigeonNumber: string;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

export type PigeonInput = Omit<Pigeon, "id" | "createdAt" | "updatedAt">;

interface PigeonsState {
  pigeons: Pigeon[];
  addPigeon: (input: PigeonInput) => Pigeon;
  updatePigeon: (id: string, input: Partial<PigeonInput>) => void;
  removePigeon: (id: string) => void;
  getPigeonById: (id: string) => Pigeon | undefined;
  formatIdentifier: (pigeon: Pigeon) => string;
}

export const usePigeonsStore = create<PigeonsState>()(
  persist(
    (set, get) => ({
      pigeons: [],

      addPigeon: (input) => {
        const now = new Date();
        const pigeon: Pigeon = {
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
          ...input,
        };
        set((state) => ({ pigeons: [pigeon, ...state.pigeons] }));
        return pigeon;
      },

      updatePigeon: (id, input) => {
        set((state) => ({
          pigeons: state.pigeons.map((p) =>
            p.id === id ? { ...p, ...input, updatedAt: new Date() } : p
          ),
        }));
      },

      removePigeon: (id) => {
        set((state) => ({
          pigeons: state.pigeons.filter((p) => p.id !== id),
        }));
      },

      getPigeonById: (id) => get().pigeons.find((p) => p.id === id),

      formatIdentifier: (pigeon) => {
        const yearShort = String(pigeon.year).slice(-2).padStart(2, "0");
        return `${pigeon.clubNumber}-${pigeon.breederNumber}-${pigeon.pigeonNumber}-${yearShort}`;
      },
    }),
    {
      name: "art-pigeons",
      partialize: (state) => ({ pigeons: state.pigeons }),
      version: 4,
      migrate: (persistedState: unknown, version: number) => {
        if (version < 4) {
          return { pigeons: [] };
        }
        return persistedState as { pigeons: Pigeon[] };
      },
    }
  )
);

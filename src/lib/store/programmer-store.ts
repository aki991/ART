import { create } from "zustand";
import { generateRingId } from "@/lib/programmer/ring-id-generator";

export interface ProgrammedRing {
  id: string;
  ringId: string;
  pigeonIdentifier: string;
  pigeonColor: string;
  programmedAt: Date;
}

interface ProgrammerState {
  currentScannedRing: string | null;
  scannedAt: Date | null;
  sessionPrograms: ProgrammedRing[];
  isScanning: boolean;
  isProgramming: boolean;

  scanRing: () => Promise<void>;
  clearScannedRing: () => void;
  programRing: (data: {
    pigeonIdentifier: string;
    pigeonColor: string;
  }) => Promise<{ success: boolean; error?: string }>;
  removeProgrammedRing: (id: string) => void;
  clearSession: () => void;
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const useProgrammerStore = create<ProgrammerState>((set, get) => ({
  currentScannedRing: null,
  scannedAt: null,
  sessionPrograms: [],
  isScanning: false,
  isProgramming: false,

  scanRing: async () => {
    set({ isScanning: true });
    await delay(800);
    set({
      currentScannedRing: generateRingId(),
      scannedAt: new Date(),
      isScanning: false,
    });
  },

  clearScannedRing: () => set({ currentScannedRing: null, scannedAt: null }),

  programRing: async ({ pigeonIdentifier, pigeonColor }) => {
    const { currentScannedRing, sessionPrograms } = get();

    if (!currentScannedRing) {
      return { success: false, error: "Nema očitanog prstena" };
    }
    if (!pigeonColor.trim()) {
      return { success: false, error: "Boja goluba je obavezna" };
    }
    if (sessionPrograms.some((p) => p.ringId === currentScannedRing)) {
      return { success: false, error: "Prsten je već programiran u ovoj sesiji" };
    }

    set({ isProgramming: true });
    await delay(600);

    const newRing: ProgrammedRing = {
      id: crypto.randomUUID(),
      ringId: currentScannedRing,
      pigeonIdentifier: pigeonIdentifier.trim() || "Drugi golub",
      pigeonColor: pigeonColor.trim(),
      programmedAt: new Date(),
    };

    set((state) => ({
      sessionPrograms: [newRing, ...state.sessionPrograms],
      currentScannedRing: null,
      scannedAt: null,
      isProgramming: false,
    }));

    return { success: true };
  },

  removeProgrammedRing: (id) =>
    set((state) => ({
      sessionPrograms: state.sessionPrograms.filter((p) => p.id !== id),
    })),

  clearSession: () =>
    set({
      sessionPrograms: [],
      currentScannedRing: null,
      scannedAt: null,
    }),
}));

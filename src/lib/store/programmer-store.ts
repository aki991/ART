import { create } from "zustand";
import { useEmulatorStore } from "./emulator-store";
import { PIGEON_COLOR_PALETTE } from "@/lib/utils/pigeon-palette";

export interface ProgrammedRing {
  id: string;
  ringId: string;
  ringColor: string;
  pigeonIdentifier: string;
  pigeonColor: string;
  programmedAt: Date;
}

interface ProgrammerState {
  sessionPrograms: ProgrammedRing[];
  isProgramming: boolean;
  selectedRingId: string | null;
  selectedSlotIndex: number | null;

  programRing: (data: {
    ringId: string;
    pigeonIdentifier: string;
    pigeonColor: string;
  }) => Promise<{ success: boolean; error?: string }>;
  removeProgrammedRing: (id: string) => void;
  clearSession: () => void;
  selectRing: (ringId: string, slotIndex: number) => void;
  clearSelectedRing: () => void;
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const useProgrammerStore = create<ProgrammerState>((set, get) => ({
  sessionPrograms: [],
  isProgramming: false,
  selectedRingId: null,
  selectedSlotIndex: null,

  programRing: async ({ ringId, pigeonIdentifier, pigeonColor }) => {
    const { sessionPrograms } = get();

    if (!pigeonColor.trim()) {
      return { success: false, error: "Boja goluba je obavezna" };
    }
    if (sessionPrograms.some((p) => p.ringId === ringId)) {
      return { success: false, error: "Prsten je već programiran u ovoj sesiji" };
    }

    set({ isProgramming: true });
    await delay(600);

    const emulatorSlots = useEmulatorStore.getState().slots;
    const slot = emulatorSlots.find((s) => s.ringId === ringId);
    const ringColor = slot?.ringColor ?? PIGEON_COLOR_PALETTE[0];

    const newRing: ProgrammedRing = {
      id: crypto.randomUUID(),
      ringId,
      ringColor,
      pigeonIdentifier: pigeonIdentifier.trim() || "Drugi golub",
      pigeonColor: pigeonColor.trim(),
      programmedAt: new Date(),
    };

    set((state) => ({
      sessionPrograms: [newRing, ...state.sessionPrograms],
      isProgramming: false,
      selectedRingId: null,
      selectedSlotIndex: null,
    }));

    return { success: true };
  },

  removeProgrammedRing: (id) => {
    const program = get().sessionPrograms.find((p) => p.id === id);
    if (program) {
      useEmulatorStore.getState().markInserted(program.ringId);
    }
    set((state) => ({
      sessionPrograms: state.sessionPrograms.filter((p) => p.id !== id),
    }));
  },

  clearSession: () => {
    const { sessionPrograms } = get();
    const emulator = useEmulatorStore.getState();
    sessionPrograms.forEach((p) => emulator.markInserted(p.ringId));
    set({ sessionPrograms: [], selectedRingId: null, selectedSlotIndex: null });
  },

  selectRing: (ringId, slotIndex) =>
    set({ selectedRingId: ringId, selectedSlotIndex: slotIndex }),

  clearSelectedRing: () =>
    set({ selectedRingId: null, selectedSlotIndex: null }),
}));

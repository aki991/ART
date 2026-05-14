import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
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

const STORAGE_KEY = "art-session-programs";

function reviveRings(rings: ProgrammedRing[]): ProgrammedRing[] {
  return rings.map((r) => ({ ...r, programmedAt: new Date(r.programmedAt) }));
}

// sessionPrograms is the single source of truth for which rings are "programmed".
// It is persisted so the /emulator page (separate tab) can derive slot status from it.
export const useProgrammerStore = create<ProgrammerState>()(
  persist(
    (set, get) => ({
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
          pigeonIdentifier: pigeonIdentifier.trim() || "—",
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

      removeProgrammedRing: (id) =>
        set((state) => ({
          sessionPrograms: state.sessionPrograms.filter((p) => p.id !== id),
        })),

      clearSession: () =>
        set({ sessionPrograms: [], selectedRingId: null, selectedSlotIndex: null }),

      selectRing: (ringId, slotIndex) =>
        set({ selectedRingId: ringId, selectedSlotIndex: slotIndex }),

      clearSelectedRing: () =>
        set({ selectedRingId: null, selectedSlotIndex: null }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage, {
        reviver: (key, value) =>
          key === "programmedAt" && typeof value === "string" ? new Date(value) : value,
      }),
      partialize: (state) => ({ sessionPrograms: state.sessionPrograms }),
    }
  )
);

// Cross-tab sync — re-hydrate when another tab writes to localStorage
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue) as {
          state?: { sessionPrograms?: ProgrammedRing[] };
        };
        if (parsed.state?.sessionPrograms) {
          useProgrammerStore.setState({
            sessionPrograms: reviveRings(parsed.state.sessionPrograms),
          });
        }
      } catch {
        // Ignore malformed storage events
      }
    }
  });
}

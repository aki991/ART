import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { PIGEON_COLOR_PALETTE } from "@/lib/utils/pigeon-palette";

// Physical state of a base-station slot only. Whether a ring is "programmed"
// is NOT stored here — it is derived from useProgrammerStore.sessionPrograms.
export type SlotStatus = "empty" | "inserted";

export interface EmulatorSlot {
  index: number;
  status: SlotStatus;
  ringId: string | null;
  ringColor: string;
}

interface EmulatorState {
  slots: EmulatorSlot[];
  insertRing: (slotIndex: number) => void;
  ejectRing: (slotIndex: number) => void;
  getInsertedRings: () => EmulatorSlot[];
  setSlotColor: (slotIndex: number, color: string) => void;
  reset: () => void;
}

function initSlots(): EmulatorSlot[] {
  return Array.from({ length: 8 }, (_, i) => ({
    index: i + 1,
    status: "empty" as SlotStatus,
    ringId: null,
    ringColor: PIGEON_COLOR_PALETTE[0],
  }));
}

function generateRingId(): string {
  const chars = "0123456789ABCDEF";
  let id = "";
  for (let i = 0; i < 4; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

export const useEmulatorStore = create<EmulatorState>()(
  persist(
    (set, get) => ({
      slots: initSlots(),

      insertRing: (slotIndex) =>
        set((state) => ({
          slots: state.slots.map((slot) =>
            slot.index === slotIndex
              ? { ...slot, status: "inserted", ringId: generateRingId() }
              : slot
          ),
        })),

      ejectRing: (slotIndex) =>
        set((state) => ({
          slots: state.slots.map((slot) =>
            slot.index === slotIndex
              ? { ...slot, status: "empty", ringId: null }
              : slot
          ),
        })),

      getInsertedRings: () => get().slots.filter((s) => s.status === "inserted"),

      setSlotColor: (slotIndex, color) =>
        set((state) => ({
          slots: state.slots.map((slot) =>
            slot.index === slotIndex ? { ...slot, ringColor: color } : slot
          ),
        })),

      reset: () => set({ slots: initSlots() }),
    }),
    {
      name: "art-emulator-slots",
      storage: createJSONStorage(() => localStorage),
      version: 3,
      migrate: () => ({ slots: initSlots() }),
    }
  )
);

// Cross-tab sync — re-hydrate when another tab writes to localStorage
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "art-emulator-slots" && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue) as { state?: { slots?: EmulatorSlot[] } };
        if (parsed.state?.slots) {
          useEmulatorStore.setState({ slots: parsed.state.slots });
        }
      } catch {
        // Ignore malformed storage events
      }
    }
  });
}

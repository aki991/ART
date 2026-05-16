import { create } from "zustand";
import type { LiveAltitudeReading } from "@/lib/types/race";

interface LiveRaceState {
  /** All readings from the DB for the active race, sorted by elapsed_seconds. */
  readings: LiveAltitudeReading[];
  setReadings: (next: LiveAltitudeReading[]) => void;
  clear: () => void;
}

export const useLiveRaceStore = create<LiveRaceState>((set) => ({
  readings: [],
  setReadings: (next) => set({ readings: next }),
  clear: () => set({ readings: [] }),
}));

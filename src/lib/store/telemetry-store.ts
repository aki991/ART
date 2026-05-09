import { create } from "zustand";
import type { TelemetryReading, PigeonProfile } from "@/lib/telemetry/types";

interface TelemetryState {
  readings: Map<string, TelemetryReading[]>;
  profiles: PigeonProfile[];
  isPaused: boolean;
  sessionMaxAltitude: number;
  sessionMinAltitude: number;
  totalReadings: number;
  sessionStartedAt: Date | null;

  addReading: (reading: TelemetryReading) => void;
  setProfiles: (profiles: PigeonProfile[]) => void;
  setPaused: (paused: boolean) => void;
  resetSession: () => void;
  startSession: () => void;
}

const INITIAL_READINGS = new Map<string, TelemetryReading[]>();

export const useTelemetryStore = create<TelemetryState>((set) => ({
  readings: INITIAL_READINGS,
  profiles: [],
  isPaused: false,
  sessionMaxAltitude: 0,
  sessionMinAltitude: Infinity,
  totalReadings: 0,
  sessionStartedAt: null,

  addReading: (reading) =>
    set((state) => {
      if (state.isPaused) return {};

      const readings = new Map(state.readings);
      const existing = readings.get(reading.ringId) ?? [];
      const updated = [...existing, reading];
      readings.set(
        reading.ringId,
        updated.length > 240 ? updated.slice(updated.length - 240) : updated
      );

      return {
        readings,
        sessionMaxAltitude: Math.max(
          state.sessionMaxAltitude,
          reading.altitudeMeters
        ),
        sessionMinAltitude: Math.min(
          state.sessionMinAltitude,
          reading.altitudeMeters
        ),
        totalReadings: state.totalReadings + 1,
      };
    }),

  setProfiles: (profiles) => set({ profiles }),

  setPaused: (isPaused) => set({ isPaused }),

  resetSession: () =>
    set({
      readings: new Map(),
      sessionMaxAltitude: 0,
      sessionMinAltitude: Infinity,
      totalReadings: 0,
      sessionStartedAt: null,
    }),

  startSession: () =>
    set({
      readings: new Map(),
      sessionMaxAltitude: 0,
      sessionMinAltitude: Infinity,
      totalReadings: 0,
      sessionStartedAt: new Date(),
      isPaused: false,
    }),
}));

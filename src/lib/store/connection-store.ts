import { create } from "zustand";
import { useLiveRaceStore } from "@/lib/store/live-race-store";
import { clearActivePigeons } from "@/lib/telemetry/flight-model";
import { cancelRace as cancelRaceAction } from "@/app/actions/races";
import {
  releaseSimulatorRole,
} from "@/lib/hooks/useRaceSimulator";
import type { RaceVisibility } from "@/lib/types/race";

export type ConnectionMethod = "usb-c" | "bluetooth" | null;

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

export interface DeviceInfo {
  deviceId: string;
  firmwareVersion: string;
  batteryPct: number;
}

export interface ActiveRacePigeon {
  id: string;            // ringId — local key for chart series
  pigeonId: string;      // UUID iz baze (pigeons.id) — DB key
  racePigeonId: string;  // UUID race_pigeons reda
  name: string;          // full_ring_number za prikaz
  color: string;         // chart line color
  pigeonColor: string;   // boja goluba (npr. "Arap")
}

interface BeginRaceSessionInput {
  raceId: string;
  name: string;
  visibility: RaceVisibility;
  pigeons: ActiveRacePigeon[];
  startedAtMs: number;
}

interface ConnectionState {
  status: ConnectionStatus;
  method: ConnectionMethod;
  deviceInfo: DeviceInfo | null;
  errorMessage: string | null;
  connectedAt: Date | null;

  raceActive: boolean;
  raceId: string | null;
  raceName: string;
  raceVisibility: RaceVisibility;
  raceStartedAtMs: number | null;
  activeRacePigeons: ActiveRacePigeon[];
  /**
   * Synchronously toggled to true by handleEndRace BEFORE any async work,
   * so any in-flight interval callbacks (simulator tick, lifecycle poll,
   * readings poll) can early-exit instead of acting on stale state.
   */
  isEndingRace: boolean;

  setStatus: (status: ConnectionStatus) => void;
  setMethod: (method: ConnectionMethod) => void;
  setDeviceInfo: (info: DeviceInfo | null) => void;
  setError: (message: string | null) => void;
  setRaceName: (name: string) => void;
  setRaceVisibility: (visibility: RaceVisibility) => void;
  reset: () => void;
  connectWithMethod: (method: "usb-c" | "bluetooth") => Promise<void>;
  disconnect: () => Promise<void>;
  beginRaceSession: (input: BeginRaceSessionInput) => void;
  finishRaceSession: () => void;
  markEndingRace: () => void;
  clearEndingRace: () => void;
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  status: "disconnected",
  method: null,
  deviceInfo: null,
  errorMessage: null,
  connectedAt: null,

  raceActive: false,
  raceId: null,
  raceName: "",
  raceVisibility: "private",
  raceStartedAtMs: null,
  activeRacePigeons: [],
  isEndingRace: false,

  setStatus: (status) => set({ status }),
  setMethod: (method) => set({ method }),
  setDeviceInfo: (deviceInfo) => set({ deviceInfo }),
  setError: (errorMessage) =>
    set({ errorMessage, status: errorMessage ? "error" : "disconnected" }),
  setRaceName: (raceName) => set({ raceName }),
  setRaceVisibility: (raceVisibility) => set({ raceVisibility }),

  reset: () => {
    useLiveRaceStore.getState().clear();
    clearActivePigeons();
    set({
      status: "disconnected",
      method: null,
      deviceInfo: null,
      errorMessage: null,
      connectedAt: null,
      raceActive: false,
      raceId: null,
      raceName: "",
      raceVisibility: "private",
      raceStartedAtMs: null,
      activeRacePigeons: [],
      isEndingRace: false,
    });
  },

  connectWithMethod: async (method) => {
    set({ status: "connecting", method });
    await new Promise<void>((resolve) => setTimeout(resolve, 800));
    set({
      status: "connected",
      connectedAt: new Date(),
      raceActive: false,
      deviceInfo: {
        deviceId: "ART-DEMO-001",
        firmwareVersion: "1.0.0",
        batteryPct: 87,
      },
    });
  },

  disconnect: async () => {
    const { raceActive, raceId } = get();
    if (raceActive && raceId) {
      set({ isEndingRace: true });
      releaseSimulatorRole(raceId);
      await cancelRaceAction(raceId);
    }
    useLiveRaceStore.getState().clear();
    clearActivePigeons();
    set({
      status: "disconnected",
      method: null,
      deviceInfo: null,
      errorMessage: null,
      connectedAt: null,
      raceActive: false,
      raceId: null,
      raceName: "",
      raceVisibility: "private",
      raceStartedAtMs: null,
      activeRacePigeons: [],
      isEndingRace: false,
    });
  },

  beginRaceSession: ({ raceId, name, visibility, pigeons, startedAtMs }) => {
    set({
      raceActive: true,
      raceId,
      raceName: name,
      raceVisibility: visibility,
      raceStartedAtMs: startedAtMs,
      activeRacePigeons: pigeons,
      isEndingRace: false,
    });
  },

  finishRaceSession: () => {
    const { raceId } = get();
    if (raceId) releaseSimulatorRole(raceId);
    useLiveRaceStore.getState().clear();
    clearActivePigeons();
    set({
      raceActive: false,
      raceId: null,
      raceName: "",
      raceStartedAtMs: null,
      activeRacePigeons: [],
      isEndingRace: false,
    });
  },

  markEndingRace: () => set({ isEndingRace: true }),
  clearEndingRace: () => set({ isEndingRace: false }),
}));

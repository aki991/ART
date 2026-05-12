import { create } from "zustand";
import { toast } from "sonner";
import { useTelemetryStore } from "@/lib/store/telemetry-store";
import { useRacesStore, type RacePigeon } from "@/lib/store/races-store";
import { useProgrammerStore } from "@/lib/store/programmer-store";
import { setActiveRacePigeons, clearActivePigeons } from "@/lib/telemetry/flight-model";

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

interface ConnectionState {
  status: ConnectionStatus;
  method: ConnectionMethod;
  deviceInfo: DeviceInfo | null;
  errorMessage: string | null;
  connectedAt: Date | null;
  raceActive: boolean;
  activeRacePigeons: RacePigeon[];
  raceName: string;

  setStatus: (status: ConnectionStatus) => void;
  setMethod: (method: ConnectionMethod) => void;
  setDeviceInfo: (info: DeviceInfo | null) => void;
  setError: (message: string | null) => void;
  setRaceName: (name: string) => void;
  reset: () => void;
  connectWithMethod: (method: "usb-c" | "bluetooth") => Promise<void>;
  disconnect: () => void;
  startRace: () => void;
  endRace: () => void;
}

function saveCurrentRace(activeRacePigeons: RacePigeon[], raceName: string): void {
  const { recordingBuffer, recordingStartedAt } = useTelemetryStore.getState();

  if (recordingBuffer.length >= 2 && recordingStartedAt !== null) {
    useRacesStore.getState().saveRace({
      name: raceName.trim() || "Bez naziva",
      owner: "Andreja",
      club: "-",
      startedAt: recordingStartedAt,
      endedAt: Date.now(),
      pigeons: activeRacePigeons,
      readings: recordingBuffer,
    });

    toast.success("Rezultat sačuvan", {
      description: `${recordingBuffer.length} mernih tačaka snimljeno`,
    });
  }
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  status: "disconnected",
  method: null,
  deviceInfo: null,
  errorMessage: null,
  connectedAt: null,
  raceActive: false,
  activeRacePigeons: [],
  raceName: "",

  setStatus: (status) => set({ status }),
  setMethod: (method) => set({ method }),
  setDeviceInfo: (deviceInfo) => set({ deviceInfo }),
  setError: (errorMessage) =>
    set({ errorMessage, status: errorMessage ? "error" : "disconnected" }),
  setRaceName: (raceName) => set({ raceName }),
  reset: () =>
    set({
      status: "disconnected",
      method: null,
      deviceInfo: null,
      errorMessage: null,
      connectedAt: null,
      raceActive: false,
      activeRacePigeons: [],
      raceName: "",
    }),

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

  disconnect: () => {
    const { raceActive, activeRacePigeons, raceName } = get();
    if (raceActive) {
      saveCurrentRace(activeRacePigeons, raceName);
    }
    useTelemetryStore.getState().stopSimulation();
    useTelemetryStore.getState().resetTelemetry();
    clearActivePigeons();
    set({
      status: "disconnected",
      method: null,
      deviceInfo: null,
      errorMessage: null,
      connectedAt: null,
      raceActive: false,
      activeRacePigeons: [],
      raceName: "",
    });
  },

  startRace: () => {
    const { sessionPrograms } = useProgrammerStore.getState();
    const { raceName } = get();

    if (sessionPrograms.length === 0) {
      toast.error("Nema programiranih prstenova");
      return;
    }
    if (!raceName.trim()) {
      toast.error("Unesi naziv trke");
      return;
    }

    const racePigeons: RacePigeon[] = sessionPrograms.map((p) => ({
      id: p.ringId,
      name: p.pigeonIdentifier,
      color: p.ringColor,
    }));
    setActiveRacePigeons(racePigeons.map((p) => p.id));
    useTelemetryStore.getState().startSimulation();
    set({ raceActive: true, activeRacePigeons: racePigeons });
  },

  endRace: () => {
    if (!get().raceActive) return;
    const { activeRacePigeons, raceName } = get();
    saveCurrentRace(activeRacePigeons, raceName);
    useTelemetryStore.getState().stopSimulation();
    useTelemetryStore.getState().resetTelemetry();
    clearActivePigeons();
    set({ raceActive: false, activeRacePigeons: [], raceName: "" });
  },
}));

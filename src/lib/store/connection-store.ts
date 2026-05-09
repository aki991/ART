import { create } from "zustand";

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

  setStatus: (status: ConnectionStatus) => void;
  setMethod: (method: ConnectionMethod) => void;
  setDeviceInfo: (info: DeviceInfo | null) => void;
  setError: (message: string | null) => void;
  reset: () => void;
  connectWithMethod: (method: "usb-c" | "bluetooth") => Promise<void>;
  disconnect: () => void;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  status: "disconnected",
  method: null,
  deviceInfo: null,
  errorMessage: null,

  setStatus: (status) => set({ status }),
  setMethod: (method) => set({ method }),
  setDeviceInfo: (deviceInfo) => set({ deviceInfo }),
  setError: (errorMessage) =>
    set({ errorMessage, status: errorMessage ? "error" : "disconnected" }),
  reset: () =>
    set({
      status: "disconnected",
      method: null,
      deviceInfo: null,
      errorMessage: null,
    }),

  connectWithMethod: async (method) => {
    set({ status: "connecting", method });
    await new Promise<void>((resolve) => setTimeout(resolve, 800));
    set({
      status: "connected",
      deviceInfo: {
        deviceId: "ART-DEMO-001",
        firmwareVersion: "1.0.0",
        batteryPct: 87,
      },
    });
  },

  disconnect: () =>
    set({
      status: "disconnected",
      method: null,
      deviceInfo: null,
      errorMessage: null,
    }),
}));

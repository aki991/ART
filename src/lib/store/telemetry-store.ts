import { create } from "zustand";
import type { TelemetryReading } from "@/lib/telemetry/types";
import type { RaceReading } from "@/lib/store/races-store";
import { computeAltitudes } from "@/lib/telemetry/flight-model";

const RECORDING_INTERVAL_TICKS = 2; // 1s interval (2 × 500ms)

let simulationInterval: ReturnType<typeof setInterval> | null = null;
let simulationStartTime: number | null = null;

interface TelemetryState {
  readings: Map<string, TelemetryReading[]>;
  sessionMaxAltitude: number;
  sessionMinAltitude: number;
  totalReadings: number;
  sessionStartedAt: Date | null;
  recordingBuffer: RaceReading[];
  recordingCounter: number;
  recordingStartedAt: number | null;

  startSimulation: () => void;
  stopSimulation: () => void;
  resetTelemetry: () => void;
}

export const useTelemetryStore = create<TelemetryState>((set) => ({
  readings: new Map(),
  sessionMaxAltitude: 0,
  sessionMinAltitude: Infinity,
  totalReadings: 0,
  sessionStartedAt: null,
  recordingBuffer: [],
  recordingCounter: 0,
  recordingStartedAt: null,

  startSimulation: () => {
    if (simulationInterval !== null) clearInterval(simulationInterval);
    simulationStartTime = Date.now();

    const startReading: RaceReading = {
      timestamp: simulationStartTime,
      altitudes: computeAltitudes(0),
    };

    set({
      readings: new Map(),
      sessionMaxAltitude: 0,
      sessionMinAltitude: Infinity,
      totalReadings: 0,
      sessionStartedAt: new Date(),
      recordingBuffer: [startReading],
      recordingCounter: RECORDING_INTERVAL_TICKS,
      recordingStartedAt: simulationStartTime,
    });
    simulationInterval = setInterval(tick, 500);
  },

  stopSimulation: () => {
    if (simulationInterval !== null) {
      clearInterval(simulationInterval);
      simulationInterval = null;
    }
    simulationStartTime = null;
  },

  resetTelemetry: () =>
    set({
      readings: new Map(),
      sessionMaxAltitude: 0,
      sessionMinAltitude: Infinity,
      totalReadings: 0,
      sessionStartedAt: null,
      recordingBuffer: [],
      recordingCounter: 0,
      recordingStartedAt: null,
    }),
}));

function tick() {
  if (simulationStartTime === null) return;
  const elapsedSeconds = (Date.now() - simulationStartTime) / 1000;
  const now = new Date();
  const altitudes = computeAltitudes(elapsedSeconds);

  useTelemetryStore.setState((state) => {
    const readings = new Map(state.readings);
    let maxAlt = state.sessionMaxAltitude;
    let minAlt = state.sessionMinAltitude;
    let total = state.totalReadings;

    for (const [ringId, alt] of Object.entries(altitudes)) {
      const reading: TelemetryReading = {
        ringId,
        pigeonName: ringId,
        altitudeMeters: alt,
        timestamp: now,
      };
      const existing = readings.get(ringId) ?? [];
      const updated = [...existing, reading];
      readings.set(
        ringId,
        updated.length > 240 ? updated.slice(updated.length - 240) : updated
      );
      maxAlt = Math.max(maxAlt, alt);
      minAlt = Math.min(minAlt, alt);
      total++;
    }

    let newRecordingBuffer = state.recordingBuffer;
    let newRecordingCounter = state.recordingCounter;

    if (state.recordingStartedAt !== null) {
      newRecordingCounter = state.recordingCounter + 1;
      if (newRecordingCounter >= RECORDING_INTERVAL_TICKS) {
        newRecordingBuffer = [
          ...state.recordingBuffer,
          { timestamp: now.getTime(), altitudes },
        ];
        newRecordingCounter = 0;
      }
    }

    return {
      readings,
      sessionMaxAltitude: maxAlt,
      sessionMinAltitude: minAlt,
      totalReadings: total,
      recordingBuffer: newRecordingBuffer,
      recordingCounter: newRecordingCounter,
    };
  });
}

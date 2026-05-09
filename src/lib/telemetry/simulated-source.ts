import type {
  TelemetryDataSource,
  TelemetryReading,
  TelemetryReadingHandler,
  PigeonProfile,
} from "./types";
import { FlightSimulator } from "./flight-model";

export const SIMULATED_PIGEONS: PigeonProfile[] = [
  { ringId: "A4F3", pigeonName: "Apolon", color: "#00D2FF", cruisingAltitude: 850 },
  { ringId: "B5E8", pigeonName: "Hera",   color: "#3B82F6", cruisingAltitude: 700 },
  { ringId: "C6D9", pigeonName: "Zeus",   color: "#10B981", cruisingAltitude: 550 },
  { ringId: "D7CA", pigeonName: "Atina",  color: "#F59E0B", cruisingAltitude: 400 },
  { ringId: "E8DB", pigeonName: "Hermes", color: "#EC4899", cruisingAltitude: 300 },
];

export class SimulatedTelemetrySource implements TelemetryDataSource {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private readonly handlers: Set<TelemetryReadingHandler> = new Set();
  private readonly simulators: Map<string, FlightSimulator> = new Map();
  private startTime: Date | null = null;

  start(): void {
    if (this.intervalId !== null) return;
    this.startTime = new Date();
    for (const profile of SIMULATED_PIGEONS) {
      this.simulators.set(
        profile.ringId,
        new FlightSimulator(profile, this.startTime)
      );
    }
    this.intervalId = setInterval(() => this.emitReadings(), 500);
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.simulators.clear();
    this.startTime = null;
  }

  isRunning(): boolean {
    return this.intervalId !== null;
  }

  onReading(handler: TelemetryReadingHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  getProfiles(): PigeonProfile[] {
    return SIMULATED_PIGEONS;
  }

  private emitReadings(): void {
    const now = new Date();
    for (const profile of SIMULATED_PIGEONS) {
      const sim = this.simulators.get(profile.ringId);
      if (!sim) continue;
      const reading: TelemetryReading = {
        ringId: profile.ringId,
        pigeonName: profile.pigeonName,
        altitudeMeters: sim.getCurrentAltitude(now),
        timestamp: now,
      };
      this.handlers.forEach((h) => h(reading));
    }
  }
}

export const simulatedTelemetrySource = new SimulatedTelemetrySource();

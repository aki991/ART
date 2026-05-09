export interface TelemetryReading {
  ringId: string;
  pigeonName: string;
  altitudeMeters: number;
  timestamp: Date;
}

export interface PigeonProfile {
  ringId: string;
  pigeonName: string;
  color: string;
  cruisingAltitude: number;
}

export type TelemetryReadingHandler = (reading: TelemetryReading) => void;

export interface TelemetryDataSource {
  start(): void;
  stop(): void;
  isRunning(): boolean;
  onReading(handler: TelemetryReadingHandler): () => void;
  getProfiles(): PigeonProfile[];
}

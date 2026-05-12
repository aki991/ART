import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const MAX_RACES = 30;

export interface RacePigeon {
  id: string;
  name: string;
  color: string;
}

export interface RaceReading {
  timestamp: number;
  altitudes: Record<string, number>;
}

export interface PigeonStatistics {
  pigeonId: string;
  avgAltitude: number;
  maxAltitude: number;
  timeAbove800Seconds: number;
  totalDurationSeconds: number;
  validFlight: boolean;
}

export interface Race {
  id: string;
  name: string;
  owner: string;
  club: string;
  startedAt: number;
  endedAt: number;
  pigeons: RacePigeon[];
  readings: RaceReading[];
  statistics: PigeonStatistics[];
}

interface RacesState {
  races: Race[];
  saveRace: (input: Omit<Race, "id" | "statistics">) => Race;
  deleteRace: (id: string) => void;
  getRaceById: (id: string) => Race | undefined;
}

const TARGET_READING_COUNT = 40;

function downsampleReadings(readings: RaceReading[]): RaceReading[] {
  if (readings.length <= TARGET_READING_COUNT) return readings;

  const result: RaceReading[] = [readings[0]];
  const middleCount = TARGET_READING_COUNT - 2;
  const step = (readings.length - 2) / (middleCount + 1);

  for (let i = 1; i <= middleCount; i++) {
    result.push(readings[Math.round(step * i)]);
  }

  result.push(readings[readings.length - 1]);
  return result;
}

function computeStatistics(
  pigeons: RacePigeon[],
  readings: RaceReading[],
  startedAt: number,
  endedAt: number
): PigeonStatistics[] {
  const totalDurationSeconds = (endedAt - startedAt) / 1000;

  return pigeons.map((pigeon) => {
    const validReadings = readings.filter(
      (r) => typeof r.altitudes[pigeon.id] === "number"
    );

    if (validReadings.length === 0) {
      return {
        pigeonId: pigeon.id,
        avgAltitude: 0,
        maxAltitude: 0,
        timeAbove800Seconds: 0,
        totalDurationSeconds,
        validFlight: false,
      };
    }

    const altitudes = validReadings.map((r) => r.altitudes[pigeon.id]);
    const avgAltitude = altitudes.reduce((sum, a) => sum + a, 0) / altitudes.length;
    const maxAltitude = Math.max(...altitudes);

    let timeAbove800Seconds = 0;
    for (let i = 0; i < validReadings.length; i++) {
      const altitude = validReadings[i].altitudes[pigeon.id];
      const nextTimestamp =
        i < validReadings.length - 1 ? validReadings[i + 1].timestamp : endedAt;
      const weightSeconds = (nextTimestamp - validReadings[i].timestamp) / 1000;
      if (altitude > 800) timeAbove800Seconds += weightSeconds;
    }
    timeAbove800Seconds = Math.round(timeAbove800Seconds);

    const validFlight =
      totalDurationSeconds > 0
        ? timeAbove800Seconds / totalDurationSeconds > 0.5
        : false;

    return {
      pigeonId: pigeon.id,
      avgAltitude: Math.round(avgAltitude),
      maxAltitude: Math.round(maxAltitude),
      timeAbove800Seconds,
      totalDurationSeconds,
      validFlight,
    };
  });
}

export const useRacesStore = create<RacesState>()(
  persist(
    (set, get) => ({
      races: [],

      saveRace: (input) => {
        const downsampledReadings = downsampleReadings(input.readings);
        const statistics = computeStatistics(
          input.pigeons,
          downsampledReadings,
          input.startedAt,
          input.endedAt
        );
        const race: Race = {
          id: crypto.randomUUID(),
          ...input,
          readings: downsampledReadings,
          statistics,
        };

        set((state) => {
          const updated = [race, ...state.races];
          return { races: updated.length > MAX_RACES ? updated.slice(0, MAX_RACES) : updated };
        });

        return race;
      },

      deleteRace: (id) =>
        set((state) => ({ races: state.races.filter((r) => r.id !== id) })),

      getRaceById: (id) => get().races.find((r) => r.id === id),
    }),
    {
      name: "art-races",
      storage: createJSONStorage(() => localStorage),
      version: 3,
      migrate: (_, version) => {
        if (version < 3) return { races: [] };
        return { races: [] };
      },
    }
  )
);

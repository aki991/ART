export type RaceVisibility = "private" | "club" | "public";
export type RaceStatus = "in_progress" | "completed" | "cancelled";

export interface Race {
  id: string;
  owner_id: string;
  club_id: string | null;
  name: string;
  visibility: RaceVisibility;
  status: RaceStatus;
  goal_altitude: number;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  max_altitude: number | null;
  avg_altitude: number | null;
  is_valid: boolean;
  created_at: string;
  updated_at: string;
}

export interface RacePigeon {
  id: string;
  race_id: string;
  pigeon_id: string;
  programmed_ring_id: string | null;
  programmed_slot: number | null;
  pigeon_full_ring_number: string;
  pigeon_color: string;
  pigeon_name: string | null;
  max_altitude: number | null;
  avg_altitude: number | null;
  reached_goal: boolean;
  created_at: string;
}

export interface AltitudeReading {
  id: string;
  race_pigeon_id: string;
  altitude: number;
  elapsed_seconds: number;
  recorded_at: string;
  created_at: string;
}

export interface LiveAltitudeReading {
  id: string;
  race_pigeon_id: string;
  pigeon_id: string;
  altitude: number;
  elapsed_seconds: number;
  recorded_at: string;
}

export interface RaceWithDetails extends Race {
  owner_profile: {
    username: string;
    first_name: string;
    last_name: string;
  } | null;
  club: {
    id: string;
    name: string;
    city: string;
  } | null;
  race_pigeons: (RacePigeon & {
    readings: AltitudeReading[];
  })[];
}

export interface RaceListItem extends Race {
  owner_profile: {
    username: string;
    first_name: string;
    last_name: string;
  } | null;
  club: {
    id: string;
    name: string;
    city: string;
  } | null;
  pigeon_count: number;
}

export interface TopPigeonAggregation {
  pigeon_id: string;
  full_ring_number: string;
  color: string;
  name: string | null;
  race_count: number;
  valid_count: number;
  max_altitude: number;
}

export interface RaceStatsAggregation {
  totalPigeons: number;
  totalRaces: number;
  validRaces: number;
  maxAltitude: number;
}

export interface PigeonRaceHistoryItem {
  race_pigeon_id: string;
  race_id: string;
  race_name: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  max_altitude: number | null;
  avg_altitude: number | null;
  reached_goal: boolean;
  goal_altitude: number;
}

export interface StartRaceInput {
  name: string;
  visibility: RaceVisibility;
  programmedRings: Array<{
    ringId: string;
    slot: number | null;
    pigeonId: string;
  }>;
}

export interface AltitudeBatchEntry {
  pigeonId: string;
  altitude: number;
  elapsedSeconds: number;
}

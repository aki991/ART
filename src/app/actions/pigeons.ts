"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResponse } from "./club-types";
import type { Pigeon, PigeonInput, PigeonPatch } from "@/lib/types/pigeon";
import { computeFlightStats } from "@/lib/utils/flight-stats";

const PIGEON_COLUMNS =
  "id, owner_id, ring_country, ring_number, ring_segment_3, ring_segment_4, ring_year, full_ring_number, color, name, is_archived, created_at, updated_at";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

function refresh() {
  revalidatePath("/pigeons");
  revalidatePath("/programming");
}

function normalizeInput(input: PigeonInput | PigeonPatch) {
  const out: Record<string, string | null> = {};
  if ("ringCountry" in input && input.ringCountry !== undefined) {
    out.ring_country = input.ringCountry.trim().toUpperCase();
  }
  if ("ringNumber" in input && input.ringNumber !== undefined) {
    out.ring_number = input.ringNumber.trim();
  }
  if ("ringSegment3" in input && input.ringSegment3 !== undefined) {
    out.ring_segment_3 = input.ringSegment3.trim();
  }
  if ("ringSegment4" in input && input.ringSegment4 !== undefined) {
    out.ring_segment_4 = input.ringSegment4.trim();
  }
  if ("ringYear" in input && input.ringYear !== undefined) {
    out.ring_year = input.ringYear.trim();
  }
  if ("color" in input && input.color !== undefined) {
    out.color = input.color.trim();
  }
  if ("name" in input) {
    const nm = (input.name ?? "").toString().trim();
    out.name = nm === "" ? null : nm;
  }
  return out;
}

function validateRequired(input: PigeonInput): string | null {
  if (!input.ringCountry?.trim()) return "Prefiks alkice je obavezan (npr. SRB).";
  if (!input.ringNumber?.trim()) return "Broj društva je obavezan.";
  if (!input.ringSegment3?.trim()) return "Treći segment alkice je obavezan.";
  if (!input.ringSegment4?.trim()) return "Četvrti segment alkice je obavezan.";
  if (!input.ringYear?.trim()) return "Godina je obavezna.";
  if (!input.color?.trim()) return "Boja goluba je obavezna.";

  if (!/^[A-Za-z]{1,3}$/.test(input.ringCountry.trim())) {
    return "Prefiks sme da sadrži samo slova (do 3 karaktera).";
  }
  if (!/^\d+$/.test(input.ringNumber.trim())) {
    return "Broj društva sme da sadrži samo cifre.";
  }
  if (!/^\d+$/.test(input.ringSegment3.trim())) {
    return "Treći segment sme da sadrži samo cifre.";
  }
  if (!/^\d+$/.test(input.ringSegment4.trim())) {
    return "Četvrti segment sme da sadrži samo cifre.";
  }
  if (!/^\d{1,2}$/.test(input.ringYear.trim())) {
    return "Godina mora biti 1 ili 2 cifre.";
  }
  return null;
}

function formatRingFromInput(input: PigeonInput): string {
  return `${input.ringCountry.trim().toUpperCase()}-${input.ringNumber.trim()}-${input.ringSegment3.trim()}-${input.ringSegment4.trim()}-${input.ringYear.trim()}`;
}

// === READ ===

export async function getMyPigeons(): Promise<ActionResponse<Pigeon[]>> {
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };

  const { data, error } = await supabase
    .from("pigeons")
    .select(PIGEON_COLUMNS)
    .eq("owner_id", user.id)
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data: (data ?? []) as Pigeon[] };
}

export async function getPigeonById(
  id: string
): Promise<ActionResponse<Pigeon | null>> {
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };

  const { data, error } = await supabase
    .from("pigeons")
    .select(PIGEON_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) return { success: false, error: error.message };
  return { success: true, data: (data ?? null) as Pigeon | null };
}

export async function searchMyPigeons(
  query: string
): Promise<ActionResponse<Pigeon[]>> {
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };

  const term = query.trim();
  let q = supabase
    .from("pigeons")
    .select(PIGEON_COLUMNS)
    .eq("owner_id", user.id)
    .eq("is_archived", false)
    .order("created_at", { ascending: false })
    .limit(20);

  if (term) {
    const escaped = term.replace(/[%_]/g, "\\$&");
    q = q.or(`full_ring_number.ilike.%${escaped}%,name.ilike.%${escaped}%,color.ilike.%${escaped}%`);
  }

  const { data, error } = await q;
  if (error) return { success: false, error: error.message };
  return { success: true, data: (data ?? []) as Pigeon[] };
}

// === CREATE ===

export interface ArchivedPigeonInput {
  ringCountry: string;
  ringNumber: string;
  ringSegment3: string;
  ringSegment4: string;
  ringYear: string;
  color?: string;
}

export async function findOrCreateOwnedPigeon(
  input: ArchivedPigeonInput
): Promise<ActionResponse<{ pigeonId: string; fullRingNumber: string }>> {
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };

  const ring_country = input.ringCountry.trim().toUpperCase();
  const ring_number = input.ringNumber.trim();
  const ring_segment_3 = input.ringSegment3.trim();
  const ring_segment_4 = input.ringSegment4.trim();
  const ring_year = input.ringYear.trim();
  const color = input.color?.trim() || "";

  if (!ring_country || !ring_number || !ring_segment_3 || !ring_segment_4 || !ring_year) {
    return { success: false, error: "Broj alkice mora imati svih 5 segmenata." };
  }
  if (!color) {
    return { success: false, error: "Boja goluba je obavezna." };
  }

  const fullRingNumber = `${ring_country}-${ring_number}-${ring_segment_3}-${ring_segment_4}-${ring_year}`;

  const { data: existing, error: lookupErr } = await supabase
    .from("pigeons")
    .select("id, is_archived")
    .eq("owner_id", user.id)
    .eq("ring_country", ring_country)
    .eq("ring_number", ring_number)
    .eq("ring_segment_3", ring_segment_3)
    .eq("ring_segment_4", ring_segment_4)
    .eq("ring_year", ring_year)
    .maybeSingle();

  if (lookupErr) return { success: false, error: lookupErr.message };

  if (existing) {
    // If the pigeon was previously created as archived (e.g., legacy
    // programming flow), restore it into the user's active list so its
    // history continues to be tracked alongside other pigeons.
    if (existing.is_archived) {
      const { error: updateErr } = await supabase
        .from("pigeons")
        .update({ is_archived: false, color })
        .eq("id", existing.id)
        .eq("owner_id", user.id);
      if (updateErr) return { success: false, error: updateErr.message };
      refresh();
    }
    return { success: true, data: { pigeonId: existing.id, fullRingNumber } };
  }

  const { data: created, error: insertErr } = await supabase
    .from("pigeons")
    .insert({
      owner_id: user.id,
      ring_country,
      ring_number,
      ring_segment_3,
      ring_segment_4,
      ring_year,
      color,
      name: null,
      is_archived: false,
    })
    .select("id")
    .single();

  if (insertErr) return { success: false, error: insertErr.message };
  refresh();
  return { success: true, data: { pigeonId: created.id, fullRingNumber } };
}

export async function createPigeon(
  input: PigeonInput
): Promise<ActionResponse<Pigeon>> {
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };

  const validationError = validateRequired(input);
  if (validationError) return { success: false, error: validationError };

  const normalized = normalizeInput(input);

  const { data, error } = await supabase
    .from("pigeons")
    .insert({
      owner_id: user.id,
      ring_country: normalized.ring_country,
      ring_number: normalized.ring_number,
      ring_segment_3: normalized.ring_segment_3,
      ring_segment_4: normalized.ring_segment_4,
      ring_year: normalized.ring_year,
      color: normalized.color,
      name: normalized.name ?? null,
    })
    .select(PIGEON_COLUMNS)
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        error: `Već imate goluba sa brojem alkice ${formatRingFromInput(input)}.`,
      };
    }
    return { success: false, error: error.message };
  }

  refresh();
  return { success: true, data: data as Pigeon };
}

// === UPDATE ===

export async function updatePigeon(
  id: string,
  patch: PigeonPatch
): Promise<ActionResponse<Pigeon>> {
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };

  const normalized = normalizeInput(patch);
  if (Object.keys(normalized).length === 0) {
    return { success: false, error: "Nema promena za snimanje." };
  }

  if (typeof normalized.ring_country === "string" && !/^[A-Za-z]{1,3}$/.test(normalized.ring_country)) {
    return { success: false, error: "Prefiks sme da sadrži samo slova (do 3 karaktera)." };
  }
  for (const k of ["ring_number", "ring_segment_3", "ring_segment_4"] as const) {
    const v = normalized[k];
    if (typeof v === "string" && !/^\d+$/.test(v)) {
      return { success: false, error: "Numerička polja sme da sadrže samo cifre." };
    }
  }
  if (typeof normalized.ring_year === "string" && !/^\d{1,2}$/.test(normalized.ring_year)) {
    return { success: false, error: "Godina mora biti 1 ili 2 cifre." };
  }
  if (typeof normalized.color === "string" && normalized.color === "") {
    return { success: false, error: "Boja goluba ne sme da bude prazna." };
  }

  const { data, error } = await supabase
    .from("pigeons")
    .update(normalized)
    .eq("id", id)
    .eq("owner_id", user.id)
    .select(PIGEON_COLUMNS)
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        error: "Već imate goluba sa istim brojem alkice.",
      };
    }
    return { success: false, error: error.message };
  }

  refresh();
  return { success: true, data: data as Pigeon };
}

// === DELETE ===

export async function deletePigeon(
  id: string
): Promise<ActionResponse<{ id: string }>> {
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };

  const { error } = await supabase
    .from("pigeons")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) return { success: false, error: error.message };

  refresh();
  return { success: true, data: { id } };
}

// === STATS ===

export type PigeonFlightStatus = "completed" | "cancelled" | "active";

export interface PigeonStats {
  pigeon: {
    id: string;
    full_ring_number: string;
    name: string | null;
    color: string;
    created_at: string;
  };
  stats: {
    total_races: number;
    valid_races: number;
    invalid_races: number;
    cancelled_races: number;
    valid_percentage: number;
    avg_max_altitude: number;
    highest_altitude_ever: number;
    highest_altitude_race_id: string | null;
    longest_flight_seconds: number;
    longest_flight_race_id: string | null;
    avg_time_above_goal_seconds: number;
  };
  trend: Array<{
    race_id: string;
    race_name: string;
    race_date: string;
    max_altitude: number;
    is_valid: boolean;
  }>;
  history: Array<{
    race_id: string;
    race_name: string;
    race_date: string;
    duration_seconds: number;
    max_altitude: number | null;
    time_above_goal_seconds: number;
    percentage_above_goal: number;
    is_valid: boolean;
    race_status: PigeonFlightStatus;
  }>;
}

type RacePigeonStatsRow = {
  id: string;
  race_id: string;
  max_altitude: number | null;
  race: {
    name: string;
    started_at: string;
    status: string;
  } | null;
};

// Kompletan "karton" jednog goluba: osnovni podaci + statistika svih
// vremena + trend + istorija. Per-let statistika (vreme, % iznad 800m,
// validnost) računa se iz altitude_readings istom logikom kao izveštaj
// na /races/[id] — race_pigeons NEMA te kolone snimljene.
export async function getPigeonStats(
  pigeonId: string
): Promise<PigeonStats | null> {
  const { supabase, user } = await requireUser();
  if (!user) return null;

  // RLS (pigeons.owner_id = auth.uid()) + eksplicitni owner filter →
  // tuđi golub vraća null, stranica prikazuje not-found.
  const { data: pigeon, error: pigeonErr } = await supabase
    .from("pigeons")
    .select("id, full_ring_number, name, color, created_at")
    .eq("id", pigeonId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (pigeonErr || !pigeon) return null;

  const { data: rpData, error: rpErr } = await supabase
    .from("race_pigeons")
    .select("id, race_id, max_altitude, race:races!inner(name, started_at, status)")
    .eq("pigeon_id", pigeonId)
    .eq("race.owner_id", user.id);

  if (rpErr) {
    console.error("getPigeonStats - race_pigeons error:", rpErr);
    return null;
  }

  const rows = ((rpData ?? []) as unknown as RacePigeonStatsRow[]).filter(
    (r): r is RacePigeonStatsRow & { race: NonNullable<RacePigeonStatsRow["race"]> } =>
      r.race !== null
  );

  // Sva merenja za sve letove ovog goluba u jednom upitu.
  const readingsByRp = new Map<string, { altitude: number }[]>();
  if (rows.length > 0) {
    const { data: readings, error: readingsErr } = await supabase
      .from("altitude_readings")
      .select("race_pigeon_id, altitude")
      .in(
        "race_pigeon_id",
        rows.map((r) => r.id)
      );
    if (readingsErr) {
      console.error("getPigeonStats - readings error:", readingsErr);
      return null;
    }
    for (const r of (readings ?? []) as {
      race_pigeon_id: string;
      altitude: number;
    }[]) {
      const list = readingsByRp.get(r.race_pigeon_id);
      if (list) list.push({ altitude: r.altitude });
      else readingsByRp.set(r.race_pigeon_id, [{ altitude: r.altitude }]);
    }
  }

  const flights = rows.map((row) => {
    const { totalSec, aboveSec, pctAbove } = computeFlightStats(
      readingsByRp.get(row.id) ?? []
    );
    const status: PigeonFlightStatus =
      row.race.status === "completed"
        ? "completed"
        : row.race.status === "cancelled"
          ? "cancelled"
          : "active";
    return {
      race_id: row.race_id,
      race_name: row.race.name,
      race_date: row.race.started_at,
      status,
      max_altitude: row.max_altitude,
      total_time_sec: totalSec,
      above_vis_sec: aboveSec,
      pct_above: pctAbove,
      // Validnost ima smisla samo za završen let; isti prag kao izveštaj.
      valid_flight: status === "completed" && pctAbove > 50,
    };
  });

  const completed = flights.filter((f) => f.status === "completed");
  const validFlights = completed.filter((f) => f.valid_flight);
  const invalidFlights = completed.filter((f) => !f.valid_flight);
  const cancelled = flights.filter((f) => f.status === "cancelled");

  const validMaxAlts = validFlights
    .map((f) => f.max_altitude)
    .filter((v): v is number => v !== null);
  const avgMaxAlt =
    validMaxAlts.length > 0
      ? Math.round(validMaxAlts.reduce((a, b) => a + b, 0) / validMaxAlts.length)
      : 0;

  let highestAlt = 0;
  let highestAltRaceId: string | null = null;
  for (const f of completed) {
    if (f.max_altitude !== null && f.max_altitude > highestAlt) {
      highestAlt = f.max_altitude;
      highestAltRaceId = f.race_id;
    }
  }

  let longestSec = 0;
  let longestRaceId: string | null = null;
  for (const f of completed) {
    if (f.total_time_sec > longestSec) {
      longestSec = f.total_time_sec;
      longestRaceId = f.race_id;
    }
  }

  const avgTimeAboveGoal =
    validFlights.length > 0
      ? Math.round(
          validFlights.reduce((a, f) => a + f.above_vis_sec, 0) /
            validFlights.length
        )
      : 0;

  return {
    pigeon: {
      id: pigeon.id,
      full_ring_number: pigeon.full_ring_number,
      name: pigeon.name,
      color: pigeon.color,
      created_at: pigeon.created_at,
    },
    stats: {
      total_races: flights.length,
      valid_races: validFlights.length,
      invalid_races: invalidFlights.length,
      cancelled_races: cancelled.length,
      valid_percentage:
        completed.length > 0
          ? Math.round((validFlights.length / completed.length) * 100)
          : 0,
      avg_max_altitude: avgMaxAlt,
      highest_altitude_ever: highestAlt,
      highest_altitude_race_id: highestAltRaceId,
      longest_flight_seconds: longestSec,
      longest_flight_race_id: longestRaceId,
      avg_time_above_goal_seconds: avgTimeAboveGoal,
    },
    trend: completed
      .filter((f) => f.max_altitude !== null)
      .map((f) => ({
        race_id: f.race_id,
        race_name: f.race_name,
        race_date: f.race_date,
        max_altitude: f.max_altitude as number,
        is_valid: f.valid_flight,
      }))
      .sort(
        (a, b) =>
          new Date(a.race_date).getTime() - new Date(b.race_date).getTime()
      ),
    history: [...flights]
      .sort(
        (a, b) =>
          new Date(b.race_date).getTime() - new Date(a.race_date).getTime()
      )
      .map((f) => ({
        race_id: f.race_id,
        race_name: f.race_name,
        race_date: f.race_date,
        duration_seconds: f.total_time_sec,
        max_altitude: f.max_altitude,
        time_above_goal_seconds: f.above_vis_sec,
        percentage_above_goal: Math.round(f.pct_above),
        is_valid: f.valid_flight,
        race_status: f.status,
      })),
  };
}

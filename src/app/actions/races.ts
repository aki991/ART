"use server";

import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { PIGEON_COLOR_PALETTE } from "@/lib/utils/pigeon-palette";
import type { ActionResponse } from "./club-types";
import type {
  AltitudeBatchEntry,
  LiveAltitudeReading,
  PigeonRaceHistoryItem,
  Race,
  RaceListItem,
  RaceStatsAggregation,
  RaceVisibility,
  RaceWithDetails,
  StartRaceInput,
  TopPigeonAggregation,
} from "@/lib/types/race";

const RACE_COLUMNS =
  "id, owner_id, club_id, name, visibility, status, goal_altitude, started_at, ended_at, duration_seconds, max_altitude, avg_altitude, is_valid, created_at, updated_at";

const RACE_PIGEON_COLUMNS =
  "id, race_id, pigeon_id, programmed_ring_id, programmed_slot, pigeon_full_ring_number, pigeon_color, pigeon_name, color, max_altitude, avg_altitude, reached_goal, created_at";

const READING_COLUMNS =
  "id, race_pigeon_id, altitude, elapsed_seconds, recorded_at, created_at";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

function refresh() {
  revalidatePath("/scanning");
  revalidatePath("/races");
  revalidatePath("/dashboard");
  revalidatePath("/pigeons");
}

// ─── LIFECYCLE ──────────────────────────────────────────

export async function startRace(
  input: StartRaceInput
): Promise<
  ActionResponse<{
    raceId: string;
    ringPigeonMap: Array<{
      ringId: string;
      pigeonId: string;
      racePigeonId: string;
      color: string;
    }>;
  }>
> {
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };

  if (!input.name?.trim()) {
    return { success: false, error: "Vrsta takmičenja je obavezna." };
  }
  if (!input.programmedRings || input.programmedRings.length === 0) {
    return { success: false, error: "Programiraj barem jedan prsten pre starta." };
  }

  const { data: existing } = await supabase
    .from("races")
    .select("id, name")
    .eq("owner_id", user.id)
    .eq("status", "in_progress")
    .maybeSingle();

  if (existing) {
    return {
      success: false,
      error: `Već imate aktivni let "${existing.name}". Završite ga pre nego što pokrenete novi.`,
    };
  }

  const { data: membership } = await supabase
    .from("club_members")
    .select("club_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const clubId = membership?.club_id ?? null;
  const finalVisibility: RaceVisibility =
    input.visibility === "club" && !clubId ? "private" : input.visibility;

  const pigeonIds = input.programmedRings.map((r) => r.pigeonId);
  const { data: pigeons, error: pigeonsError } = await supabase
    .from("pigeons")
    .select("id, full_ring_number, color, name, owner_id")
    .in("id", pigeonIds);

  if (pigeonsError) return { success: false, error: pigeonsError.message };
  if (!pigeons || pigeons.length === 0) {
    return { success: false, error: "Nije pronađen nijedan golub za programirane prstenove." };
  }

  const pigeonsByid = new Map(pigeons.map((p) => [p.id, p]));
  for (const r of input.programmedRings) {
    const p = pigeonsByid.get(r.pigeonId);
    if (!p || p.owner_id !== user.id) {
      return {
        success: false,
        error: "Jedan ili više programiranih golubova nije vaš ili ne postoji.",
      };
    }
  }

  const { data: race, error: raceError } = await supabase
    .from("races")
    .insert({
      owner_id: user.id,
      club_id: clubId,
      name: input.name.trim(),
      visibility: finalVisibility,
      status: "in_progress",
    })
    .select(RACE_COLUMNS)
    .single();

  if (raceError) {
    if (raceError.code === "23505") {
      return {
        success: false,
        error: "Već imate aktivni let. Završite ga pre nego što pokrenete novi.",
      };
    }
    return { success: false, error: raceError.message };
  }

  const raceId = (race as Race).id;

  const racePigeonRows = input.programmedRings.map((r, idx) => {
    const p = pigeonsByid.get(r.pigeonId)!;
    return {
      race_id: raceId,
      pigeon_id: r.pigeonId,
      programmed_ring_id: r.ringId,
      programmed_slot: r.slot,
      pigeon_full_ring_number: p.full_ring_number,
      pigeon_color: p.color,
      pigeon_name: p.name,
      color: PIGEON_COLOR_PALETTE[idx % PIGEON_COLOR_PALETTE.length],
    };
  });

  const { data: insertedRP, error: rpError } = await supabase
    .from("race_pigeons")
    .insert(racePigeonRows)
    .select("id, pigeon_id, programmed_ring_id, color");

  if (rpError) {
    await supabase.from("races").delete().eq("id", raceId);
    return { success: false, error: rpError.message };
  }

  const ringPigeonMap = (insertedRP ?? []).map((rp) => ({
    ringId: rp.programmed_ring_id as string,
    pigeonId: rp.pigeon_id as string,
    racePigeonId: rp.id as string,
    color: rp.color as string,
  }));

  refresh();
  return { success: true, data: { raceId, ringPigeonMap } };
}

export async function endRace(
  raceId: string
): Promise<ActionResponse<{ raceId: string }>> {
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };

  const { data: race, error: fetchErr } = await supabase
    .from("races")
    .select(RACE_COLUMNS)
    .eq("id", raceId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (fetchErr) return { success: false, error: fetchErr.message };
  if (!race) return { success: false, error: "Let nije pronađen." };
  if ((race as Race).status !== "in_progress") {
    return { success: false, error: "Let je već završen." };
  }

  const goalAltitude = (race as Race).goal_altitude;
  const startedAtMs = new Date((race as Race).started_at).getTime();
  const endedAtMs = Date.now();
  const durationSeconds = Math.max(0, Math.round((endedAtMs - startedAtMs) / 1000));

  // Safety net: any late-arriving "straggler" readings whose elapsed_seconds
  // exceeds the actual race duration (e.g. a simulator tick that fired right
  // as endRace started) must be purged before we compute aggregates.
  const { data: racePigeonIdsRows } = await supabase
    .from("race_pigeons")
    .select("id")
    .eq("race_id", raceId);
  const racePigeonIds = (racePigeonIdsRows ?? []).map((r) => r.id);
  if (racePigeonIds.length > 0) {
    await supabase
      .from("altitude_readings")
      .delete()
      .in("race_pigeon_id", racePigeonIds)
      .gt("elapsed_seconds", durationSeconds);
  }

  const { data: racePigeons, error: rpErr } = await supabase
    .from("race_pigeons")
    .select("id, pigeon_id, readings:altitude_readings(altitude)")
    .eq("race_id", raceId);

  if (rpErr) return { success: false, error: rpErr.message };

  type ReadingsAgg = { altitude: number };
  type RPWithReadings = { id: string; pigeon_id: string; readings: ReadingsAgg[] };

  let raceMax = 0;
  let raceSum = 0;
  let raceCount = 0;
  let isValid = false;

  const updates: Array<{
    id: string;
    max_altitude: number;
    avg_altitude: number;
    reached_goal: boolean;
  }> = [];

  for (const rp of (racePigeons ?? []) as RPWithReadings[]) {
    let max = 0;
    let sum = 0;
    const count = rp.readings.length;
    for (const r of rp.readings) {
      if (r.altitude > max) max = r.altitude;
      sum += r.altitude;
    }
    const avg = count > 0 ? Math.round(sum / count) : 0;
    const reached = max >= goalAltitude;

    if (max > raceMax) raceMax = max;
    raceSum += sum;
    raceCount += count;
    if (reached) isValid = true;

    updates.push({
      id: rp.id,
      max_altitude: Math.round(max),
      avg_altitude: avg,
      reached_goal: reached,
    });
  }

  const raceAvg = raceCount > 0 ? Math.round(raceSum / raceCount) : 0;

  for (const u of updates) {
    await supabase
      .from("race_pigeons")
      .update({
        max_altitude: u.max_altitude,
        avg_altitude: u.avg_altitude,
        reached_goal: u.reached_goal,
      })
      .eq("id", u.id);
  }

  const { error: updateErr } = await supabase
    .from("races")
    .update({
      status: "completed",
      ended_at: new Date(endedAtMs).toISOString(),
      duration_seconds: durationSeconds,
      max_altitude: Math.round(raceMax),
      avg_altitude: raceAvg,
      is_valid: isValid,
    })
    .eq("id", raceId)
    .eq("owner_id", user.id);

  if (updateErr) return { success: false, error: updateErr.message };

  refresh();
  return { success: true, data: { raceId } };
}

export async function cancelRace(
  raceId: string
): Promise<ActionResponse<{ raceId: string }>> {
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };

  const { error } = await supabase
    .from("races")
    .update({
      status: "cancelled",
      ended_at: new Date().toISOString(),
    })
    .eq("id", raceId)
    .eq("owner_id", user.id)
    .eq("status", "in_progress");

  if (error) return { success: false, error: error.message };

  refresh();
  return { success: true, data: { raceId } };
}

// ─── READINGS ───────────────────────────────────────────

export async function recordAltitudeBatch(
  raceId: string,
  readings: AltitudeBatchEntry[]
): Promise<ActionResponse<{ count: number }>> {
  noStore();
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };

  if (readings.length === 0) return { success: true, data: { count: 0 } };

  const { data: race } = await supabase
    .from("races")
    .select("id, status")
    .eq("id", raceId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!race) return { success: false, error: "Let nije pronađen." };
  if (race.status !== "in_progress") {
    return { success: false, error: "Let više nije aktivan." };
  }

  const pigeonIds = Array.from(new Set(readings.map((r) => r.pigeonId)));
  const { data: rps, error: rpsErr } = await supabase
    .from("race_pigeons")
    .select("id, pigeon_id")
    .eq("race_id", raceId)
    .in("pigeon_id", pigeonIds);

  if (rpsErr) return { success: false, error: rpsErr.message };

  const idMap = new Map((rps ?? []).map((rp) => [rp.pigeon_id, rp.id]));

  const rows = readings
    .map((r) => {
      const racePigeonId = idMap.get(r.pigeonId);
      if (!racePigeonId) return null;
      return {
        race_pigeon_id: racePigeonId,
        altitude: Math.round(r.altitude),
        elapsed_seconds: Math.round(r.elapsedSeconds),
      };
    })
    .filter((x): x is { race_pigeon_id: string; altitude: number; elapsed_seconds: number } => x !== null);

  if (rows.length === 0) {
    // Sve readings su filtrirane jer nije pronađen race_pigeon za pigeonId-ove.
    // To je bug u klijentu (slanje pogrešnog ID-a) — vrati eksplicitnu grešku
    // umesto tihog success-a, da budući bug bude vidljiv odmah.
    return {
      success: false,
      error: `Nije pronađen race_pigeon za poslate ID-ove (sent: ${pigeonIds.length}, found: ${idMap.size})`,
    };
  }

  const { error: insertErr } = await supabase.from("altitude_readings").insert(rows);
  if (insertErr) return { success: false, error: insertErr.message };

  return { success: true, data: { count: rows.length } };
}

// ─── READS ──────────────────────────────────────────────

export async function getActiveRace(): Promise<ActionResponse<Race | null>> {
  noStore();
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };

  const { data, error } = await supabase
    .from("races")
    .select(RACE_COLUMNS)
    .eq("owner_id", user.id)
    .eq("status", "in_progress")
    .maybeSingle();

  if (error) return { success: false, error: error.message };
  return { success: true, data: (data ?? null) as Race | null };
}

export async function getRaceReadings(
  raceId: string
): Promise<ActionResponse<LiveAltitudeReading[]>> {
  noStore();
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };

  const { data, error } = await supabase
    .from("altitude_readings")
    .select(
      `id, race_pigeon_id, altitude, elapsed_seconds, recorded_at, race_pigeon:race_pigeons!inner(pigeon_id, race_id)`
    )
    .eq("race_pigeon.race_id", raceId)
    .order("elapsed_seconds", { ascending: true });

  if (error) return { success: false, error: error.message };

  type Row = {
    id: string;
    race_pigeon_id: string;
    altitude: number;
    elapsed_seconds: number;
    recorded_at: string;
    race_pigeon: { pigeon_id: string | null; race_id: string } | null;
  };

  const list: LiveAltitudeReading[] = ((data ?? []) as unknown as Row[])
    .filter((r): r is Row & { race_pigeon: { pigeon_id: string; race_id: string } } =>
      r.race_pigeon !== null && r.race_pigeon.pigeon_id !== null
    )
    .map((r) => ({
      id: r.id,
      race_pigeon_id: r.race_pigeon_id,
      pigeon_id: r.race_pigeon.pigeon_id,
      altitude: r.altitude,
      elapsed_seconds: r.elapsed_seconds,
      recorded_at: r.recorded_at,
    }));

  return { success: true, data: list };
}

export async function getMyRaces(
  options: { limit?: number; status?: "all" | "completed" | "in_progress" } = {}
): Promise<ActionResponse<RaceListItem[]>> {
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };

  let q = supabase
    .from("races")
    .select(
      `${RACE_COLUMNS}, owner_profile:profiles!races_owner_id_fkey(username, first_name, last_name), club:clubs(id, name, city), race_pigeons(id)`
    )
    .eq("owner_id", user.id)
    .order("started_at", { ascending: false });

  if (options.status && options.status !== "all") {
    q = q.eq("status", options.status);
  }
  if (options.limit) q = q.limit(options.limit);

  const { data, error } = await q;
  if (error) return { success: false, error: error.message };

  const list = (data ?? []).map((row) => {
    const r = row as unknown as Race & {
      race_pigeons?: { id: string }[];
      owner_profile?: RaceListItem["owner_profile"];
      club?: RaceListItem["club"];
    };
    return {
      ...(r as Race),
      owner_profile: r.owner_profile ?? null,
      club: r.club ?? null,
      pigeon_count: r.race_pigeons?.length ?? 0,
    } as RaceListItem;
  });

  return { success: true, data: list };
}

export async function getVisibleRaces(
  filter: "all" | "mine" | "club" | "public" = "all"
): Promise<ActionResponse<RaceListItem[]>> {
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };

  let q = supabase
    .from("races")
    .select(
      `${RACE_COLUMNS}, owner_profile:profiles!races_owner_id_fkey(username, first_name, last_name), club:clubs(id, name, city), race_pigeons(id)`
    )
    .order("started_at", { ascending: false })
    .limit(200);

  if (filter === "mine") q = q.eq("owner_id", user.id);
  else if (filter === "club") q = q.eq("visibility", "club").neq("owner_id", user.id);
  else if (filter === "public") q = q.eq("visibility", "public").neq("owner_id", user.id);

  const { data, error } = await q;
  if (error) return { success: false, error: error.message };

  const list = (data ?? []).map((row) => {
    const r = row as unknown as Race & {
      race_pigeons?: { id: string }[];
      owner_profile?: RaceListItem["owner_profile"];
      club?: RaceListItem["club"];
    };
    return {
      ...(r as Race),
      owner_profile: r.owner_profile ?? null,
      club: r.club ?? null,
      pigeon_count: r.race_pigeons?.length ?? 0,
    } as RaceListItem;
  });

  return { success: true, data: list };
}

export async function getRaceById(
  id: string
): Promise<ActionResponse<RaceWithDetails | null>> {
  noStore();
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };

  const { data, error } = await supabase
    .from("races")
    .select(
      `${RACE_COLUMNS}, owner_profile:profiles!races_owner_id_fkey(username, first_name, last_name), club:clubs(id, name, city), race_pigeons(${RACE_PIGEON_COLUMNS}, pigeon:pigeons(is_archived), readings:altitude_readings(${READING_COLUMNS}))`
    )
    .eq("id", id)
    .maybeSingle();

  if (error) return { success: false, error: error.message };
  if (!data) return { success: true, data: null };

  return { success: true, data: data as unknown as RaceWithDetails };
}

export async function deleteRace(
  id: string
): Promise<ActionResponse<{ id: string }>> {
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };

  const { error } = await supabase
    .from("races")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) return { success: false, error: error.message };

  refresh();
  return { success: true, data: { id } };
}

// ─── DASHBOARD AGREGACIJE ───────────────────────────────

export async function getLastRace(): Promise<
  ActionResponse<RaceWithDetails | null>
> {
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };

  const { data: latest, error: latestErr } = await supabase
    .from("races")
    .select("id")
    .eq("owner_id", user.id)
    .eq("status", "completed")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestErr) return { success: false, error: latestErr.message };
  if (!latest) return { success: true, data: null };

  return getRaceById(latest.id);
}

export async function getTopPigeons(
  limit = 3
): Promise<ActionResponse<TopPigeonAggregation[]>> {
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };

  const { data, error } = await supabase
    .from("race_pigeons")
    .select(
      `pigeon_id, pigeon_full_ring_number, pigeon_color, pigeon_name, max_altitude, reached_goal, race:races!inner(owner_id, status), pigeon:pigeons!inner(is_archived)`
    )
    .eq("race.owner_id", user.id)
    .eq("race.status", "completed")
    .eq("pigeon.is_archived", false)
    .not("pigeon_id", "is", null);

  if (error) return { success: false, error: error.message };

  type Row = {
    pigeon_id: string;
    pigeon_full_ring_number: string;
    pigeon_color: string;
    pigeon_name: string | null;
    max_altitude: number | null;
    reached_goal: boolean;
  };

  const buckets = new Map<string, TopPigeonAggregation>();
  for (const row of (data ?? []) as Row[]) {
    const key = row.pigeon_id;
    const existing = buckets.get(key);
    if (existing) {
      existing.race_count++;
      if (row.reached_goal) existing.valid_count++;
      if ((row.max_altitude ?? 0) > existing.max_altitude) {
        existing.max_altitude = row.max_altitude ?? 0;
      }
    } else {
      buckets.set(key, {
        pigeon_id: row.pigeon_id,
        full_ring_number: row.pigeon_full_ring_number,
        color: row.pigeon_color,
        name: row.pigeon_name,
        race_count: 1,
        valid_count: row.reached_goal ? 1 : 0,
        max_altitude: row.max_altitude ?? 0,
      });
    }
  }

  const list = Array.from(buckets.values())
    .sort((a, b) =>
      b.max_altitude !== a.max_altitude
        ? b.max_altitude - a.max_altitude
        : b.valid_count / Math.max(1, b.race_count) -
          a.valid_count / Math.max(1, a.race_count)
    )
    .slice(0, limit);

  return { success: true, data: list };
}

export async function getRaceStats(): Promise<
  ActionResponse<RaceStatsAggregation>
> {
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };

  const { count: pigeonCount } = await supabase
    .from("pigeons")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", user.id);

  const { data: races, error } = await supabase
    .from("races")
    .select("id, is_valid, max_altitude, status")
    .eq("owner_id", user.id);

  if (error) return { success: false, error: error.message };

  let totalRaces = 0;
  let validRaces = 0;
  let maxAltitude = 0;

  for (const r of races ?? []) {
    if (r.status === "completed") {
      totalRaces++;
      if (r.is_valid) validRaces++;
      if ((r.max_altitude ?? 0) > maxAltitude) maxAltitude = r.max_altitude ?? 0;
    }
  }

  return {
    success: true,
    data: {
      totalPigeons: pigeonCount ?? 0,
      totalRaces,
      validRaces,
      maxAltitude,
    },
  };
}

// ─── PIGEON HISTORY ─────────────────────────────────────

export async function getPigeonRaceHistory(
  pigeonId: string
): Promise<ActionResponse<PigeonRaceHistoryItem[]>> {
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };

  const VIS_THRESHOLD_M = 800;
  const READING_INTERVAL_S = 5;

  const { data, error } = await supabase
    .from("race_pigeons")
    .select(
      `id, max_altitude, avg_altitude, reached_goal, race:races!inner(id, name, started_at, ended_at, duration_seconds, goal_altitude, status, owner_id)`
    )
    .eq("pigeon_id", pigeonId)
    .eq("race.owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: error.message };

  type Row = {
    id: string;
    max_altitude: number | null;
    avg_altitude: number | null;
    reached_goal: boolean;
    race: {
      id: string;
      name: string;
      started_at: string;
      ended_at: string | null;
      duration_seconds: number | null;
      goal_altitude: number;
      status: string;
    } | null;
  };

  const completedRows = ((data ?? []) as unknown as Row[]).filter(
    (row) => row.race !== null && row.race.status === "completed"
  );

  const racePigeonIds = completedRows.map((r) => r.id);
  const readingsByRacePigeon = new Map<string, { total: number; above: number }>();
  for (const id of racePigeonIds) readingsByRacePigeon.set(id, { total: 0, above: 0 });

  if (racePigeonIds.length > 0) {
    const { data: readings, error: readingsErr } = await supabase
      .from("altitude_readings")
      .select("race_pigeon_id, altitude")
      .in("race_pigeon_id", racePigeonIds);
    if (readingsErr) return { success: false, error: readingsErr.message };
    for (const r of (readings ?? []) as { race_pigeon_id: string; altitude: number }[]) {
      const bucket = readingsByRacePigeon.get(r.race_pigeon_id);
      if (!bucket) continue;
      bucket.total += 1;
      if (r.altitude >= VIS_THRESHOLD_M) bucket.above += 1;
    }
  }

  const list: PigeonRaceHistoryItem[] = completedRows
    .map((row) => {
      const counts = readingsByRacePigeon.get(row.id) ?? { total: 0, above: 0 };
      const total_time_sec = counts.total * READING_INTERVAL_S;
      const above_vis_sec = counts.above * READING_INTERVAL_S;
      const above_vis_pct =
        total_time_sec > 0 ? (above_vis_sec / total_time_sec) * 100 : 0;
      const reached_vis = (row.max_altitude ?? 0) >= VIS_THRESHOLD_M;
      const valid_flight = above_vis_pct > 50;
      return {
        race_pigeon_id: row.id,
        race_id: row.race!.id,
        race_name: row.race!.name,
        started_at: row.race!.started_at,
        ended_at: row.race!.ended_at,
        duration_seconds: row.race!.duration_seconds,
        max_altitude: row.max_altitude,
        avg_altitude: row.avg_altitude,
        reached_goal: row.reached_goal,
        goal_altitude: row.race!.goal_altitude,
        total_time_sec,
        above_vis_sec,
        above_vis_pct,
        reached_vis,
        valid_flight,
      };
    })
    .sort((a, b) =>
      new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    );

  return { success: true, data: list };
}

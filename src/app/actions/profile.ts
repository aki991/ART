"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { ActionResponse } from "./club-types";

export interface ProfileStats {
  total_pigeons: number;
  total_races: number;
  valid_races: number;
  max_altitude_ever: number;
}

export interface PublicProfile {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  bio: string | null;
  is_public_profile: boolean;
  created_at: string;
  stats: ProfileStats;
}

const PROFILE_COLUMNS =
  "id, username, first_name, last_name, avatar_url, bio, is_public_profile, created_at";

const MAX_BIO_LENGTH = 500;
// Base64 data URL je ~1.37× veći od izvornog fajla; ~2.8MB string ≈ 2MB slika.
const MAX_AVATAR_DATA_URL = 2_800_000;

// Service-role klijent zaobilazi RLS. Potreban za statistiku JAVNOG profila:
// pigeons/races RLS bi anon posetiocu (ili drugom korisniku) vratio 0 jer ne
// vidi tuđe podatke. Vraća null ako env ključ nije podešen → fallback na RLS.
async function createServiceClient(): Promise<SupabaseClient | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  const { createClient: createAdminClient } = await import(
    "@supabase/supabase-js"
  );
  return createAdminClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function calculateProfileStats(
  supabase: SupabaseClient,
  userId: string
): Promise<ProfileStats> {
  const [pigeons, races, valid, topAlt] = await Promise.all([
    supabase
      .from("pigeons")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", userId)
      .eq("is_archived", false),
    supabase
      .from("races")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", userId)
      .eq("status", "completed"),
    supabase
      .from("races")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", userId)
      .eq("status", "completed")
      .eq("is_valid", true),
    supabase
      .from("races")
      .select("max_altitude")
      .eq("owner_id", userId)
      .eq("status", "completed")
      .not("max_altitude", "is", null)
      .order("max_altitude", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    total_pigeons: pigeons.count ?? 0,
    total_races: races.count ?? 0,
    valid_races: valid.count ?? 0,
    max_altitude_ever:
      (topAlt.data as { max_altitude: number | null } | null)?.max_altitude ?? 0,
  };
}

/** Sopstveni profil za /profile stranicu. */
export async function getMyProfile(): Promise<PublicProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile) return null;

  // Vlasnik gleda svoje podatke → RLS klijent vraća tačnu statistiku.
  const stats = await calculateProfileStats(supabase, user.id);
  return { ...(profile as unknown as Omit<PublicProfile, "stats">), stats };
}

/** Javni profil po username-u; null ako je privatan ili ne postoji. */
export async function getPublicProfile(
  username: string
): Promise<PublicProfile | null> {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("username", username)
    .maybeSingle();

  if (error || !profile) return null;

  const typed = profile as unknown as Omit<PublicProfile, "stats">;
  // Privatnost se sprovodi ovde — RLS SELECT politika je USING(true).
  if (!typed.is_public_profile) return null;

  const statsDb = (await createServiceClient()) ?? supabase;
  const stats = await calculateProfileStats(statsDb, typed.id);
  return { ...typed, stats };
}

export async function updateBio(
  bio: string
): Promise<ActionResponse<{ bio: string | null }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };

  const trimmed = bio.trim();
  if (trimmed.length > MAX_BIO_LENGTH) {
    return {
      success: false,
      error: `Bio može imati najviše ${MAX_BIO_LENGTH} karaktera.`,
    };
  }
  const value = trimmed === "" ? null : trimmed;

  const { error } = await supabase
    .from("profiles")
    .update({ bio: value })
    .eq("id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/profile");
  return { success: true, data: { bio: value } };
}

export async function toggleProfilePrivacy(
  isPublic: boolean
): Promise<ActionResponse<{ is_public_profile: boolean }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };

  const { error } = await supabase
    .from("profiles")
    .update({ is_public_profile: isPublic })
    .eq("id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/profile");
  revalidatePath("/settings");
  return { success: true, data: { is_public_profile: isPublic } };
}

export async function saveAvatar(
  dataUrl: string
): Promise<ActionResponse<{ avatar_url: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };

  if (!dataUrl.startsWith("data:image/")) {
    return { success: false, error: "Neispravan format slike." };
  }
  if (dataUrl.length > MAX_AVATAR_DATA_URL) {
    return { success: false, error: "Slika je prevelika (maks. 2MB)." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: dataUrl })
    .eq("id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/profile");
  revalidatePath("/", "layout");
  return { success: true, data: { avatar_url: dataUrl } };
}

export async function deleteAvatar(): Promise<ActionResponse<null>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/profile");
  revalidatePath("/", "layout");
  return { success: true, data: null };
}

/** Lagani upit — samo zastavica privatnosti, za inicijalno stanje toggle-a. */
export async function getMyProfilePrivacy(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return true;

  const { data } = await supabase
    .from("profiles")
    .select("is_public_profile")
    .eq("id", user.id)
    .maybeSingle();

  return (
    (data as { is_public_profile: boolean } | null)?.is_public_profile ?? true
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import type {
  ActionResponse,
  ClubCreationInput,
  ClubCreationRequestRow,
  ClubInfoPatch,
  ClubMemberRow,
  ClubRow,
  JoinRequestRow,
  MembershipSnapshot,
} from "./club-types";

function admin() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

function refresh() {
  revalidatePath("/settings");
  revalidatePath("/super-admin/club-requests");
}

// ─── BROWSE / READ ─────────────────────────────────────

export async function getAllClubs(): Promise<ActionResponse<ClubRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clubs")
    .select("id, name, city, logo_url, created_by, created_at")
    .order("name");
  if (error) return { success: false, error: error.message };
  return { success: true, data: (data ?? []) as ClubRow[] };
}

export async function searchClubs(
  query: string
): Promise<ActionResponse<ClubRow[]>> {
  const supabase = await createClient();
  const term = query.trim();
  let q = supabase
    .from("clubs")
    .select("id, name, city, logo_url, created_by, created_at")
    .order("name")
    .limit(50);
  if (term) {
    const escaped = term.replace(/[%_]/g, "\\$&");
    q = q.or(`name.ilike.%${escaped}%,city.ilike.%${escaped}%`);
  }
  const { data, error } = await q;
  if (error) return { success: false, error: error.message };
  return { success: true, data: (data ?? []) as ClubRow[] };
}

export async function getClubById(
  id: string
): Promise<ActionResponse<ClubRow | null>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clubs")
    .select("id, name, city, logo_url, created_by, created_at")
    .eq("id", id)
    .maybeSingle();
  if (error) return { success: false, error: error.message };
  return { success: true, data: (data ?? null) as ClubRow | null };
}

export async function getClubMembers(
  clubId: string
): Promise<ActionResponse<ClubMemberRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("club_members")
    .select(
      "id, club_id, user_id, role, joined_at, profile:profiles!club_members_user_id_fkey(username, first_name, last_name, avatar_url)"
    )
    .eq("club_id", clubId)
    .order("joined_at");
  if (error) return { success: false, error: error.message };
  return { success: true, data: (data ?? []) as unknown as ClubMemberRow[] };
}

export async function getCurrentUserClub(): Promise<
  ActionResponse<MembershipSnapshot | null>
> {
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Not authenticated" };
  const { data, error } = await supabase
    .from("club_members")
    .select(
      "role, joined_at, club:clubs!club_members_club_id_fkey(id, name, city, logo_url, created_by, created_at)"
    )
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) return { success: false, error: error.message };
  if (!data || !data.club) return { success: true, data: null };
  const row = data as unknown as {
    role: "member" | "admin";
    joined_at: string;
    club: ClubRow;
  };
  return {
    success: true,
    data: { club: row.club, role: row.role, joinedAt: row.joined_at },
  };
}

// ─── JOIN REQUESTS ─────────────────────────────────────

export async function getMyPendingJoinRequest(): Promise<
  ActionResponse<(JoinRequestRow & { club: ClubRow }) | null>
> {
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Not authenticated" };
  const { data, error } = await supabase
    .from("club_join_requests")
    .select(
      "id, club_id, user_id, status, created_at, profile:profiles!club_join_requests_user_id_fkey(username, first_name, last_name, avatar_url), club:clubs!club_join_requests_club_id_fkey(id, name, city, logo_url, created_by, created_at)"
    )
    .eq("user_id", user.id)
    .eq("status", "pending")
    .maybeSingle();
  if (error) return { success: false, error: error.message };
  return {
    success: true,
    data: (data ?? null) as unknown as
      | (JoinRequestRow & { club: ClubRow })
      | null,
  };
}

export async function sendJoinRequest(
  clubId: string
): Promise<ActionResponse<{ id: string }>> {
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };

  const { data: existingMembership } = await supabase
    .from("club_members")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (existingMembership) {
    return { success: false, error: "Već ste član nekog kluba." };
  }

  const { data: existingPending } = await supabase
    .from("club_join_requests")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .maybeSingle();
  if (existingPending) {
    return { success: false, error: "Već imate aktivan zahtev — otkažite ga pre slanja novog." };
  }

  const { data: insertData, error } = await supabase
    .from("club_join_requests")
    .insert({ club_id: clubId, user_id: user.id, status: "pending" })
    .select("id")
    .single();
  if (error) return { success: false, error: error.message };
  refresh();
  return { success: true, data: { id: insertData.id } };
}

export async function cancelJoinRequest(
  requestId: string
): Promise<ActionResponse> {
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };
  const { error } = await supabase
    .from("club_join_requests")
    .update({ status: "cancelled", resolved_at: new Date().toISOString() })
    .eq("id", requestId)
    .eq("user_id", user.id)
    .eq("status", "pending");
  if (error) return { success: false, error: error.message };
  refresh();
  return { success: true, data: undefined };
}

export async function getClubJoinRequests(
  clubId: string
): Promise<ActionResponse<JoinRequestRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("club_join_requests")
    .select(
      "id, club_id, user_id, status, created_at, profile:profiles!club_join_requests_user_id_fkey(username, first_name, last_name, avatar_url)"
    )
    .eq("club_id", clubId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) return { success: false, error: error.message };
  return { success: true, data: (data ?? []) as unknown as JoinRequestRow[] };
}

async function assertClubAdmin(userId: string, clubId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("club_members")
    .select("role")
    .eq("user_id", userId)
    .eq("club_id", clubId)
    .maybeSingle();
  return data?.role === "admin";
}

export async function approveJoinRequest(
  requestId: string
): Promise<ActionResponse> {
  const { user } = await requireUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };

  const svc = admin();
  const { data: req, error: fetchErr } = await svc
    .from("club_join_requests")
    .select("id, club_id, user_id, status")
    .eq("id", requestId)
    .single();
  if (fetchErr || !req) return { success: false, error: "Zahtev nije pronađen." };
  if (req.status !== "pending") {
    return { success: false, error: "Zahtev više nije aktivan." };
  }

  const isAdmin = await assertClubAdmin(user.id, req.club_id);
  if (!isAdmin) return { success: false, error: "Niste admin ovog kluba." };

  const { data: alreadyMember } = await svc
    .from("club_members")
    .select("id")
    .eq("user_id", req.user_id)
    .maybeSingle();
  if (alreadyMember) {
    await svc
      .from("club_join_requests")
      .update({
        status: "rejected",
        resolved_at: new Date().toISOString(),
        resolved_by: user.id,
        rejection_reason: null,
      })
      .eq("id", requestId);
    return { success: false, error: "Korisnik je već član nekog kluba." };
  }

  const { error: insertErr } = await svc.from("club_members").insert({
    club_id: req.club_id,
    user_id: req.user_id,
    role: "member",
  });
  if (insertErr) return { success: false, error: insertErr.message };

  const { error: updateErr } = await svc
    .from("club_join_requests")
    .update({
      status: "approved",
      resolved_at: new Date().toISOString(),
      resolved_by: user.id,
    })
    .eq("id", requestId);
  if (updateErr) return { success: false, error: updateErr.message };

  refresh();
  return { success: true, data: undefined };
}

export async function rejectJoinRequest(
  requestId: string
): Promise<ActionResponse> {
  const { user } = await requireUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };

  const svc = admin();
  const { data: req } = await svc
    .from("club_join_requests")
    .select("id, club_id, status")
    .eq("id", requestId)
    .single();
  if (!req || req.status !== "pending") {
    return { success: false, error: "Zahtev nije aktivan." };
  }
  const isAdmin = await assertClubAdmin(user.id, req.club_id);
  if (!isAdmin) return { success: false, error: "Niste admin ovog kluba." };

  const { error } = await svc
    .from("club_join_requests")
    .update({
      status: "rejected",
      resolved_at: new Date().toISOString(),
      resolved_by: user.id,
    })
    .eq("id", requestId);
  if (error) return { success: false, error: error.message };
  refresh();
  return { success: true, data: undefined };
}

// ─── MEMBERSHIP ────────────────────────────────────────

async function countAdminsInClub(clubId: string): Promise<number> {
  const svc = admin();
  const { count } = await svc
    .from("club_members")
    .select("id", { count: "exact", head: true })
    .eq("club_id", clubId)
    .eq("role", "admin");
  return count ?? 0;
}

export async function leaveClub(): Promise<ActionResponse> {
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };

  const { data: membership } = await supabase
    .from("club_members")
    .select("id, club_id, role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!membership) return { success: false, error: "Niste član kluba." };

  if (membership.role === "admin") {
    const adminCount = await countAdminsInClub(membership.club_id);
    if (adminCount <= 1) {
      return {
        success: false,
        error:
          "Vi ste jedini admin ovog kluba — promovišite drugog člana pre nego što napustite klub.",
      };
    }
  }

  const { error } = await supabase
    .from("club_members")
    .delete()
    .eq("id", membership.id);
  if (error) return { success: false, error: error.message };
  refresh();
  return { success: true, data: undefined };
}

export async function removeClubMember(
  memberId: string
): Promise<ActionResponse> {
  const { user } = await requireUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };

  const svc = admin();
  const { data: target } = await svc
    .from("club_members")
    .select("id, club_id, user_id, role")
    .eq("id", memberId)
    .single();
  if (!target) return { success: false, error: "Član nije pronađen." };

  const isAdmin = await assertClubAdmin(user.id, target.club_id);
  if (!isAdmin) return { success: false, error: "Niste admin ovog kluba." };

  if (target.user_id === user.id) {
    return { success: false, error: "Ne možete da uklonite samog sebe — koristite 'Napusti klub'." };
  }

  if (target.role === "admin") {
    const adminCount = await countAdminsInClub(target.club_id);
    if (adminCount <= 1) {
      return { success: false, error: "Ne možete da uklonite jedinog admina." };
    }
  }

  const { error } = await svc.from("club_members").delete().eq("id", memberId);
  if (error) return { success: false, error: error.message };
  refresh();
  return { success: true, data: undefined };
}

export async function promoteToAdmin(
  memberId: string
): Promise<ActionResponse> {
  const { user } = await requireUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };

  const svc = admin();
  const { data: target } = await svc
    .from("club_members")
    .select("id, club_id, role")
    .eq("id", memberId)
    .single();
  if (!target) return { success: false, error: "Član nije pronađen." };

  const isAdmin = await assertClubAdmin(user.id, target.club_id);
  if (!isAdmin) return { success: false, error: "Niste admin ovog kluba." };

  if (target.role === "admin") {
    return { success: false, error: "Član je već admin." };
  }

  const { error } = await svc
    .from("club_members")
    .update({ role: "admin" })
    .eq("id", memberId);
  if (error) return { success: false, error: error.message };
  refresh();
  return { success: true, data: undefined };
}

export async function demoteFromAdmin(
  memberId: string
): Promise<ActionResponse> {
  const { user } = await requireUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };

  const svc = admin();
  const { data: target } = await svc
    .from("club_members")
    .select("id, club_id, role")
    .eq("id", memberId)
    .single();
  if (!target) return { success: false, error: "Član nije pronađen." };

  const isAdmin = await assertClubAdmin(user.id, target.club_id);
  if (!isAdmin) return { success: false, error: "Niste admin ovog kluba." };

  if (target.role !== "admin") {
    return { success: false, error: "Član nije admin." };
  }

  const adminCount = await countAdminsInClub(target.club_id);
  if (adminCount <= 1) {
    return {
      success: false,
      error:
        "Ovo je jedini admin kluba — promovišite drugog člana pre nego što ovome skinete ulogu.",
    };
  }

  const { error } = await svc
    .from("club_members")
    .update({ role: "member" })
    .eq("id", memberId);
  if (error) return { success: false, error: error.message };
  refresh();
  return { success: true, data: undefined };
}

// ─── CLUB INFO UPDATE ──────────────────────────────────

export async function updateClubInfo(
  clubId: string,
  patch: ClubInfoPatch
): Promise<ActionResponse> {
  const { user } = await requireUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };

  const isAdmin = await assertClubAdmin(user.id, clubId);
  if (!isAdmin) return { success: false, error: "Niste admin ovog kluba." };

  const update: Record<string, unknown> = {};
  if (patch.name !== undefined) update.name = patch.name.trim();
  if (patch.city !== undefined) update.city = patch.city.trim();
  if (patch.logoUrl !== undefined) update.logo_url = patch.logoUrl;
  if (Object.keys(update).length === 0) return { success: true, data: undefined };

  const svc = admin();
  const { error } = await svc.from("clubs").update(update).eq("id", clubId);
  if (error) return { success: false, error: error.message };
  refresh();
  return { success: true, data: undefined };
}

export async function uploadClubLogo(
  clubId: string,
  dataUrl: string
): Promise<ActionResponse<{ url: string }>> {
  const { user } = await requireUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };

  const isAdmin = await assertClubAdmin(user.id, clubId);
  if (!isAdmin) return { success: false, error: "Niste admin ovog kluba." };

  const parsed = parseDataUrl(dataUrl);
  if (!parsed) return { success: false, error: "Neispravan format slike." };

  const svc = admin();
  const path = `${clubId}/logo.${parsed.ext}`;
  const { error } = await svc.storage
    .from("club-logos")
    .upload(path, parsed.buffer, {
      contentType: parsed.mime,
      upsert: true,
    });
  if (error) return { success: false, error: error.message };

  const { data } = svc.storage.from("club-logos").getPublicUrl(path);
  const cacheBusted = `${data.publicUrl}?v=${Date.now()}`;
  refresh();
  return { success: true, data: { url: cacheBusted } };
}

// ─── CLUB CREATION (Super Admin flow) ──────────────────

export async function getMyClubCreationRequest(): Promise<
  ActionResponse<ClubCreationRequestRow | null>
> {
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };
  const { data, error } = await supabase
    .from("club_creation_requests")
    .select(
      "id, requested_by, proposed_name, proposed_city, proposed_logo_url, status, rejection_reason, created_at, resolved_at, requester:profiles!club_creation_requests_requested_by_fkey(username, first_name, last_name, avatar_url)"
    )
    .eq("requested_by", user.id)
    .in("status", ["pending", "rejected"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return { success: false, error: error.message };
  return { success: true, data: (data ?? null) as unknown as ClubCreationRequestRow | null };
}

export async function requestClubCreation(
  input: ClubCreationInput
): Promise<ActionResponse<{ id: string }>> {
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };

  const name = input.name.trim();
  const city = input.city.trim();
  if (!name || !city) return { success: false, error: "Naziv i grad su obavezni." };

  const { data: existing } = await supabase
    .from("club_creation_requests")
    .select("id")
    .eq("requested_by", user.id)
    .eq("status", "pending")
    .maybeSingle();
  if (existing) {
    return { success: false, error: "Već imate aktivan zahtev za kreiranje kluba." };
  }

  let logoUrl: string | null = null;
  if (input.logoDataUrl) {
    const parsed = parseDataUrl(input.logoDataUrl);
    if (!parsed) return { success: false, error: "Neispravan format slike." };
    const svc = admin();
    const path = `pending/${user.id}/${Date.now()}.${parsed.ext}`;
    const { error: uploadErr } = await svc.storage
      .from("club-logos")
      .upload(path, parsed.buffer, {
        contentType: parsed.mime,
        upsert: false,
      });
    if (uploadErr) return { success: false, error: uploadErr.message };
    logoUrl = svc.storage.from("club-logos").getPublicUrl(path).data.publicUrl;
  }

  const { data: inserted, error } = await supabase
    .from("club_creation_requests")
    .insert({
      requested_by: user.id,
      proposed_name: name,
      proposed_city: city,
      proposed_logo_url: logoUrl,
      status: "pending",
    })
    .select("id")
    .single();
  if (error) return { success: false, error: error.message };
  refresh();
  return { success: true, data: { id: inserted.id } };
}

export async function cancelClubCreationRequest(): Promise<ActionResponse> {
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Niste prijavljeni." };
  const { error } = await supabase
    .from("club_creation_requests")
    .update({ status: "cancelled", resolved_at: new Date().toISOString() })
    .eq("requested_by", user.id)
    .eq("status", "pending");
  if (error) return { success: false, error: error.message };
  refresh();
  return { success: true, data: undefined };
}

// ─── SUPER ADMIN ───────────────────────────────────────

async function requireSuperAdmin() {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false as const, error: "Niste prijavljeni." };
  const { data } = await supabase
    .from("profiles")
    .select("is_super_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!data?.is_super_admin) {
    return { ok: false as const, error: "Nemate Super Admin privilegije." };
  }
  return { ok: true as const, user };
}

export async function getAllClubCreationRequests(
  status: "pending" | "approved" | "rejected" = "pending"
): Promise<ActionResponse<ClubCreationRequestRow[]>> {
  const sa = await requireSuperAdmin();
  if (!sa.ok) return { success: false, error: sa.error };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("club_creation_requests")
    .select(
      "id, requested_by, proposed_name, proposed_city, proposed_logo_url, status, rejection_reason, created_at, resolved_at, requester:profiles!club_creation_requests_requested_by_fkey(username, first_name, last_name, avatar_url)"
    )
    .eq("status", status)
    .order("created_at", { ascending: false });
  if (error) return { success: false, error: error.message };
  return {
    success: true,
    data: (data ?? []) as unknown as ClubCreationRequestRow[],
  };
}

export async function approveClubCreation(
  requestId: string
): Promise<ActionResponse> {
  const sa = await requireSuperAdmin();
  if (!sa.ok) return { success: false, error: sa.error };

  const svc = admin();
  const { data: req, error: fetchErr } = await svc
    .from("club_creation_requests")
    .select("id, requested_by, proposed_name, proposed_city, proposed_logo_url, status")
    .eq("id", requestId)
    .single();
  if (fetchErr || !req) return { success: false, error: "Zahtev nije pronađen." };
  if (req.status !== "pending") {
    return { success: false, error: "Zahtev više nije aktivan." };
  }

  const { data: existingMembership } = await svc
    .from("club_members")
    .select("id")
    .eq("user_id", req.requested_by)
    .maybeSingle();
  if (existingMembership) {
    return {
      success: false,
      error:
        "Korisnik je već član kluba — ne može osnovati novi dok ne napusti trenutni.",
    };
  }

  const { data: newClub, error: insertErr } = await svc
    .from("clubs")
    .insert({
      name: req.proposed_name,
      city: req.proposed_city,
      logo_url: req.proposed_logo_url,
      created_by: req.requested_by,
    })
    .select("id")
    .single();
  if (insertErr || !newClub) {
    return { success: false, error: insertErr?.message ?? "Greška pri kreiranju kluba." };
  }

  const { error: memberErr } = await svc.from("club_members").insert({
    club_id: newClub.id,
    user_id: req.requested_by,
    role: "admin",
  });
  if (memberErr) {
    await svc.from("clubs").delete().eq("id", newClub.id);
    return { success: false, error: memberErr.message };
  }

  const { error: updateErr } = await svc
    .from("club_creation_requests")
    .update({
      status: "approved",
      resolved_at: new Date().toISOString(),
      resolved_by: sa.user.id,
    })
    .eq("id", requestId);
  if (updateErr) return { success: false, error: updateErr.message };

  refresh();
  return { success: true, data: undefined };
}

export async function rejectClubCreation(
  requestId: string,
  reason: string
): Promise<ActionResponse> {
  const sa = await requireSuperAdmin();
  if (!sa.ok) return { success: false, error: sa.error };

  const trimmed = reason.trim();
  if (!trimmed) return { success: false, error: "Razlog odbijanja je obavezan." };

  const svc = admin();
  const { error } = await svc
    .from("club_creation_requests")
    .update({
      status: "rejected",
      rejection_reason: trimmed,
      resolved_at: new Date().toISOString(),
      resolved_by: sa.user.id,
    })
    .eq("id", requestId)
    .eq("status", "pending");
  if (error) return { success: false, error: error.message };
  refresh();
  return { success: true, data: undefined };
}

// ─── Helpers ────────────────────────────────────────────

function parseDataUrl(
  dataUrl: string
): { mime: string; ext: string; buffer: Buffer } | null {
  const match = /^data:(image\/(jpeg|png|webp));base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  const mime = match[1];
  const ext = match[2] === "jpeg" ? "jpg" : match[2];
  const buffer = Buffer.from(match[3], "base64");
  return { mime, ext, buffer };
}


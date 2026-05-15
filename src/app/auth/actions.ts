"use server";

import { createClient } from "@/lib/supabase/server";

export type AuthActionResult =
  | { ok: true }
  | { ok: false; error: string; code?: "invalid_credentials" | "username_taken" | "email_taken" | "generic" };

export async function signInAction(
  identifier: string,
  password: string
): Promise<AuthActionResult> {
  const supabase = await createClient();
  const trimmed = identifier.trim();
  if (!trimmed || !password) {
    return { ok: false, error: "Missing credentials", code: "invalid_credentials" };
  }

  let email = trimmed;
  if (!trimmed.includes("@")) {
    // Username login: resolve to the underlying auth email via the SECURITY DEFINER RPC.
    const { data, error } = await supabase.rpc("get_email_for_username", {
      p_username: trimmed,
    });
    if (error || !data) {
      return { ok: false, error: "Invalid login", code: "invalid_credentials" };
    }
    email = data as string;
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { ok: false, error: error.message, code: "invalid_credentials" };
  }
  return { ok: true };
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

export async function deleteAccountAction(): Promise<AuthActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Not authenticated", code: "generic" };
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !url) {
    return { ok: false, error: "Missing service configuration", code: "generic" };
  }

  const { createClient: createAdminClient } = await import("@supabase/supabase-js");
  const admin = createAdminClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return { ok: false, error: error.message, code: "generic" };
  }

  await supabase.auth.signOut();
  return { ok: true };
}

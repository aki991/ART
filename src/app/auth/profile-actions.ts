"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ProfileUpdateInput {
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatarUrl: string | null;
}

export type ProfileUpdateResult =
  | { ok: true }
  | { ok: false; error: string; code?: "username_taken" | "not_authenticated" | "generic" };

export async function updateProfileAction(
  input: ProfileUpdateInput
): Promise<ProfileUpdateResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Not authenticated", code: "not_authenticated" };
  }

  const username = input.username.trim();
  if (username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(username)) {
    return { ok: false, error: "Invalid username", code: "generic" };
  }

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .neq("id", user.id)
    .maybeSingle();
  if (existing) {
    return { ok: false, error: "Username taken", code: "username_taken" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      username,
      first_name: input.firstName.trim(),
      last_name: input.lastName.trim(),
      phone: input.phone.trim() || null,
      avatar_url: input.avatarUrl,
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: error.message, code: "generic" };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

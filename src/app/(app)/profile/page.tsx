import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMyProfile } from "@/app/actions/profile";
import { ProfileClient } from "@/components/profile/ProfileClient";

export const metadata: Metadata = {
  title: "Moj profil — Aero Ring Tech",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await getMyProfile();

  if (!profile) {
    redirect("/");
  }

  return <ProfileClient profile={profile} />;
}

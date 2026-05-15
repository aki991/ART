import type { Metadata } from "next";
import { PageContainer } from "@/components/app-shell/PageContainer";
import { SettingsClient } from "@/components/settings/SettingsClient";
import {
  getClubJoinRequests,
  getClubMembers,
  getCurrentUserClub,
  getMyClubCreationRequest,
  getMyPendingJoinRequest,
  searchClubs,
} from "@/app/actions/clubs";

export const metadata: Metadata = {
  title: "Postavke — Aero Ring Tech",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const membership = await getCurrentUserClub();
  const pendingJoinRequest = await getMyPendingJoinRequest();
  const creationRequest = await getMyClubCreationRequest();

  const club = membership.success ? membership.data : null;
  const pending = pendingJoinRequest.success ? pendingJoinRequest.data : null;
  const creation = creationRequest.success ? creationRequest.data : null;

  const initialClubsList =
    !club && !pending && !creation ? await searchClubs("") : null;

  const members = club ? await getClubMembers(club.club.id) : null;
  const joinRequests =
    club?.role === "admin" ? await getClubJoinRequests(club.club.id) : null;

  return (
    <PageContainer>
      <SettingsClient
        membership={club}
        pendingJoinRequest={pending}
        creationRequest={creation}
        initialClubs={initialClubsList?.success ? initialClubsList.data : []}
        members={members?.success ? members.data : []}
        joinRequests={joinRequests?.success ? joinRequests.data : []}
      />
    </PageContainer>
  );
}

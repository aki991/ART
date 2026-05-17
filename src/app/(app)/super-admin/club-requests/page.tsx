import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageContainer } from "@/components/app-shell/PageContainer";
import { PageHeader } from "@/components/app-shell/PageHeader";
import { createClient } from "@/lib/supabase/server";
import { getAllClubCreationRequests } from "@/app/actions/clubs";
import { SuperAdminClubRequestsClient } from "@/components/super-admin/SuperAdminClubRequestsClient";

export const metadata: Metadata = {
  title: "Super Admin · Zahtevi za društva",
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

const VALID_STATUSES = ["pending", "approved", "rejected"] as const;
type Status = (typeof VALID_STATUSES)[number];

export default async function SuperAdminClubRequestsPage({
  searchParams,
}: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_super_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_super_admin) redirect("/dashboard");

  const params = await searchParams;
  const status = (
    VALID_STATUSES.includes(params.status as Status)
      ? params.status
      : "pending"
  ) as Status;

  const result = await getAllClubCreationRequests(status);
  const requests = result.success ? result.data : [];

  return (
    <PageContainer>
      <PageHeader
        title="Zahtevi za kreiranje društava"
        description="Pregled zahteva korisnika za osnivanje novih društava."
      />
      <SuperAdminClubRequestsClient activeStatus={status} requests={requests} />
    </PageContainer>
  );
}

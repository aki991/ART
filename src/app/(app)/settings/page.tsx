import type { Metadata } from "next";
import { PageContainer } from "@/components/app-shell/PageContainer";
import { SettingsClient } from "@/components/settings/SettingsClient";

export const metadata: Metadata = {
  title: "Postavke — Aero Ring Tech",
};

export default function SettingsPage() {
  return (
    <PageContainer>
      <SettingsClient />
    </PageContainer>
  );
}

import type { Metadata } from "next";
import { PageContainer } from "@/components/app-shell/PageContainer";
import { ComingSoon } from "@/components/app-shell/ComingSoon";

export const metadata: Metadata = {
  title: "Postavke — Aero Ring Tech",
};

export default function SettingsPage() {
  return (
    <PageContainer>
      <ComingSoon feature="Postavke" />
    </PageContainer>
  );
}

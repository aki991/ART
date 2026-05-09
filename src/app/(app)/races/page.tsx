import type { Metadata } from "next";
import { PageContainer } from "@/components/app-shell/PageContainer";
import { ComingSoon } from "@/components/app-shell/ComingSoon";

export const metadata: Metadata = {
  title: "Trke — Aero Ring Tech",
};

export default function RacesPage() {
  return (
    <PageContainer>
      <ComingSoon feature="Trke" />
    </PageContainer>
  );
}

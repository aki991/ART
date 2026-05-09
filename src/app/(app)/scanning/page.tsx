import type { Metadata } from "next";
import { PageContainer } from "@/components/app-shell/PageContainer";
import { ConnectionHub } from "@/components/scanning/ConnectionHub";

export const metadata: Metadata = {
  title: "Povezivanje uredjaja — Aero Ring Tech",
};

export default function ScanningPage() {
  return (
    <PageContainer>
      <ConnectionHub />
    </PageContainer>
  );
}

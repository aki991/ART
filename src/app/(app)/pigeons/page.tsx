import { PageContainer } from "@/components/app-shell/PageContainer";
import { PigeonsListView } from "@/components/pigeons/PigeonsListView";

export const metadata = { title: "Moji golubovi — Aero Ring Tech" };

export default function PigeonsPage() {
  return (
    <PageContainer fluid>
      <PigeonsListView />
    </PageContainer>
  );
}

import { PageContainer } from "@/components/app-shell/PageContainer";
import { PigeonsListView } from "@/components/pigeons/PigeonsListView";
import { getMyPigeons } from "@/app/actions/pigeons";

export const metadata = { title: "Moji golubovi — Aero Ring Tech" };
export const dynamic = "force-dynamic";

export default async function PigeonsPage() {
  const res = await getMyPigeons();
  const initial = res.success ? res.data : [];

  return (
    <PageContainer fluid>
      <PigeonsListView initialPigeons={initial} />
    </PageContainer>
  );
}

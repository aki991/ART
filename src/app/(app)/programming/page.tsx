import { PageContainer } from "@/components/app-shell/PageContainer";
import { RingProgrammerHub } from "@/components/programming/RingProgrammerHub";

export const metadata = { title: "Programiranje prstenova — Aero Ring Tech" };

export default function ProgrammingPage() {
  return (
    <PageContainer>
      <RingProgrammerHub />
    </PageContainer>
  );
}

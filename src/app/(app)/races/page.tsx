import type { Metadata } from "next";
import { RacesClient } from "@/components/races/RacesClient";
import { getVisibleRaces } from "@/app/actions/races";

export const metadata: Metadata = {
  title: "Rezultati — Aero Ring Tech",
};

export const dynamic = "force-dynamic";

export default async function RacesPage() {
  const res = await getVisibleRaces("mine");
  const initial = res.success ? res.data : [];
  return <RacesClient initialRaces={initial} />;
}

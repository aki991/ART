import type { Metadata } from "next";
import { ScanningClient } from "@/components/scanning/ScanningClient";
import { ScanningTopBar } from "@/components/scanning/ScanningTopBar";
import { getActiveRace, getRaceById } from "@/app/actions/races";

export const metadata: Metadata = {
  title: "Povezivanje uredjaja — Aero Ring Tech",
};

export const dynamic = "force-dynamic";

export default async function ScanningPage() {
  const activeRes = await getActiveRace();
  const activeRace = activeRes.success ? activeRes.data : null;

  const detailsRes = activeRace ? await getRaceById(activeRace.id) : null;
  const activeRaceDetails =
    detailsRes && detailsRes.success ? detailsRes.data : null;

  return (
    <>
      <ScanningTopBar />
      <ScanningClient initialActiveRace={activeRaceDetails} />
    </>
  );
}

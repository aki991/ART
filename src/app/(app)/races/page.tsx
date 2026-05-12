import type { Metadata } from "next";
import { RacesClient } from "@/components/races/RacesClient";

export const metadata: Metadata = {
  title: "Rezultati — Aero Ring Tech",
};

export default function RacesPage() {
  return <RacesClient />;
}

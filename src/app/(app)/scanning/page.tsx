import type { Metadata } from "next";
import { ScanningClient } from "@/components/scanning/ScanningClient";

export const metadata: Metadata = {
  title: "Povezivanje uredjaja — Aero Ring Tech",
};

export default function ScanningPage() {
  return <ScanningClient />;
}

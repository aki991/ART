import type { Metadata } from "next";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { LastRaceChart } from "@/components/dashboard/LastRaceChart";
import { RecentRacesTable } from "@/components/dashboard/RecentRacesTable";
import { TopPigeons } from "@/components/dashboard/TopPigeons";

export const metadata: Metadata = {
  title: "Dashboard — Aero Ring Tech",
};

export default function DashboardPage() {
  return (
    <div className="px-6 py-6 space-y-6">
      <DashboardStats />
      <LastRaceChart />
      <TopPigeons />
      <RecentRacesTable />
    </div>
  );
}

import type { Metadata } from "next";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { LastRaceChart } from "@/components/dashboard/LastRaceChart";
import { RecentRacesTable } from "@/components/dashboard/RecentRacesTable";
import { TopPigeons } from "@/components/dashboard/TopPigeons";
import {
  getRaceStats,
  getLastRace,
  getTopPigeons,
  getMyRaces,
} from "@/app/actions/races";

export const metadata: Metadata = {
  title: "Dashboard — Aero Ring Tech",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [statsRes, lastRaceRes, topRes, recentRes] = await Promise.all([
    getRaceStats(),
    getLastRace(),
    getTopPigeons(3),
    getMyRaces({ limit: 3, status: "completed" }),
  ]);

  const stats = statsRes.success
    ? statsRes.data
    : { totalPigeons: 0, totalRaces: 0, validRaces: 0, maxAltitude: 0 };
  const lastRace = lastRaceRes.success ? lastRaceRes.data : null;
  const topPigeons = topRes.success ? topRes.data : [];
  const recentRaces = recentRes.success ? recentRes.data : [];

  return (
    <div className="px-4 xl:px-5 2xl:px-6 py-4 xl:py-5 2xl:py-6 space-y-4 xl:space-y-5 2xl:space-y-6">
      <DashboardStats stats={stats} />
      <LastRaceChart race={lastRace} />
      <TopPigeons pigeons={topPigeons} />
      <RecentRacesTable races={recentRaces} />
    </div>
  );
}

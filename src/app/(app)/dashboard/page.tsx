import type { Metadata } from "next";
import { PageContainer } from "@/components/app-shell/PageContainer";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { WeeklyScansChart } from "@/components/dashboard/WeeklyScansChart";
import { RecentScansTable } from "@/components/dashboard/RecentScansTable";
import { NextRaceCard } from "@/components/dashboard/NextRaceCard";
import {
  getMockRecentScans,
  getMockUpcomingRace,
  getMockWeeklyScans,
} from "@/lib/mock/dashboard-data";

export const metadata: Metadata = {
  title: "Dashboard — Aero Ring Tech",
};

export default function DashboardPage() {
  const recentScans = getMockRecentScans();
  const upcomingRace = getMockUpcomingRace();
  const weeklyScans = getMockWeeklyScans();

  return (
    <PageContainer>
      <div className="space-y-6">
        <WelcomeCard />
        <StatsGrid />
        <WeeklyScansChart data={weeklyScans} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentScansTable scans={recentScans} />
          </div>
          <div>
            <NextRaceCard race={upcomingRace} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

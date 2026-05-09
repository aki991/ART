export interface DashboardStats {
  totalPigeons: number;
  totalOwners: number;
  activeRaces: number;
  totalScansThisWeek: number;
}

export interface RecentScan {
  id: string;
  ringId: string;
  pigeonName: string | null;
  antennaId: string;
  rssi: number;
  scannedAt: Date;
}

export interface UpcomingRace {
  id: string;
  name: string;
  releaseLocation: string;
  releaseDate: Date;
  participantCount: number;
}

export interface DailyScanCount {
  date: Date;
  scanCount: number;
}

export function getMockStats(): DashboardStats {
  return {
    totalPigeons: 247,
    totalOwners: 18,
    activeRaces: 2,
    totalScansThisWeek: 1842,
  };
}

export function getMockRecentScans(): RecentScan[] {
  const now = new Date();
  return [
    { id: "1", ringId: "A4F3", pigeonName: "Apolon",  antennaId: "A1", rssi: -68, scannedAt: new Date(now.getTime() - 30_000) },
    { id: "2", ringId: "B5E8", pigeonName: "Hera",    antennaId: "A2", rssi: -72, scannedAt: new Date(now.getTime() - 3 * 60_000) },
    { id: "3", ringId: "C6D9", pigeonName: null,       antennaId: "A1", rssi: -85, scannedAt: new Date(now.getTime() - 8 * 60_000) },
    { id: "4", ringId: "D7CA", pigeonName: "Zeus",     antennaId: "A2", rssi: -65, scannedAt: new Date(now.getTime() - 15 * 60_000) },
    { id: "5", ringId: "E8DB", pigeonName: "Atina",    antennaId: "A1", rssi: -78, scannedAt: new Date(now.getTime() - 22 * 60_000) },
    { id: "6", ringId: "F9EC", pigeonName: null,       antennaId: "A2", rssi: -88, scannedAt: new Date(now.getTime() - 31 * 60_000) },
    { id: "7", ringId: "0AFD", pigeonName: "Hermes",   antennaId: "A1", rssi: -71, scannedAt: new Date(now.getTime() - 39 * 60_000) },
    { id: "8", ringId: "1B0E", pigeonName: null,       antennaId: "A2", rssi: -82, scannedAt: new Date(now.getTime() - 47 * 60_000) },
  ];
}

export function getMockUpcomingRace(): UpcomingRace {
  const releaseDate = new Date(Date.now() + 3 * 86_400_000 + 4 * 3_600_000);
  return {
    id: "race-1",
    name: "Subotica - Beograd 2026",
    releaseLocation: "Subotica",
    releaseDate,
    participantCount: 47,
  };
}

export function getMockWeeklyScans(): DailyScanCount[] {
  const counts = [203, 245, 298, 312, 287, 234, 263];
  const now = new Date();
  return counts.map((scanCount, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);
    return { date, scanCount };
  });
}

// Statistika leta po golubu — deljena između tabele na /races/[id] i PDF
// izveštaja, da bi izvezeni PDF bio 1:1 sa onim što korisnik vidi na ekranu.

export const VIS_THRESHOLD_M = 800;
export const READING_INTERVAL_S = 5;

export interface FlightStats {
  totalSec: number;
  aboveSec: number;
  pctAbove: number;
}

export function computeFlightStats(
  readings: { altitude: number }[]
): FlightStats {
  if (readings.length === 0) {
    return { totalSec: 0, aboveSec: 0, pctAbove: 0 };
  }
  const totalSec = readings.length * READING_INTERVAL_S;
  const aboveSec =
    readings.filter((r) => r.altitude >= VIS_THRESHOLD_M).length *
    READING_INTERVAL_S;
  const pctAbove = totalSec > 0 ? (aboveSec / totalSec) * 100 : 0;
  return { totalSec, aboveSec, pctAbove };
}

export function formatTimeShort(totalSeconds: number): string {
  if (totalSeconds <= 0) return "—";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

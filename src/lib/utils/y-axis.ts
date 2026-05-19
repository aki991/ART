const Y_AXIS_STEP = 200;
const Y_AXIS_PADDING_RATIO = 1.1; // 10% prostor iznad max vrednosti

export function buildXTicks(xMaxMinutes: number): number[] {
  const step =
    xMaxMinutes <= 10 ? 1 :
    xMaxMinutes <= 20 ? 2 :
    xMaxMinutes <= 50 ? 5 : 10;
  const ticks: number[] = [];
  for (let t = 0; t <= xMaxMinutes; t += step) {
    ticks.push(t);
  }
  if (ticks[ticks.length - 1] < xMaxMinutes) ticks.push(xMaxMinutes);
  return ticks;
}

export interface YAxisConfig {
  domain: [number, number];
  ticks: number[];
}

// Dinamička Y-osa: gornji bound = max vrednost + 10% padding, zaokruženo na
// sledeći deljiv broj sa Y_AXIS_STEP (200m) za lepe tick labele.
// Primeri: max=500 -> 600, max=1200 -> 1400, max=2069 -> 2400.
// Nema fiksne donje granice; pozivajući kod treba da prosledi
// max(actual_data, goal_altitude) tako da i 800m VIS linija ostane unutar.
export function computeYAxisConfig(maxAltitude: number): YAxisConfig {
  const target = Math.max(maxAltitude * Y_AXIS_PADDING_RATIO, Y_AXIS_STEP);
  const upperBound = Math.ceil(target / Y_AXIS_STEP) * Y_AXIS_STEP;

  const ticks: number[] = [];
  for (let i = 0; i <= upperBound; i += Y_AXIS_STEP) {
    ticks.push(i);
  }

  return { domain: [0, upperBound], ticks };
}

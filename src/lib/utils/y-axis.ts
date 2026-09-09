const Y_AXIS_MIN_UPPER_BOUND = 10; // šum od ±1-2m ne smije razvući skalu
const Y_AXIS_PADDING_RATIO = 1.15; // 15% prostora iznad max vrednosti

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

// Korak Y-ose po pragovima visine (na target = max + padding):
// do 10m -> 2m (sitni šum sa hardvera ostaje čitljiv), do 50m -> 10m,
// do 200m -> 50m, do 1000m -> 100m, iznad toga -> 500m.
export function yAxisStep(target: number): number {
  if (target <= 10) return 2;
  if (target <= 50) return 10;
  if (target <= 200) return 50;
  if (target <= 1000) return 100;
  return 500;
}

// Dinamička Y-osa: gornji bound = max vrednost + 15% padding, zaokruženo na
// prvi umnožak koraka iz yAxisStep, uz minimum od 10m.
// Primjeri: max=2 -> 10 (korak 2), max=40 -> 50 (korak 10),
// max=150 -> 200 (korak 50), max=800 -> 1000 (korak 100), max=2069 -> 2500 (korak 500).
// Nema fiksne donje granice; pozivajući kod koji želi da mu i goal_altitude
// linija ostane u kadru treba da prosledi max(actual_data, goal_altitude).
export function computeYAxisConfig(maxAltitude: number): YAxisConfig {
  const target = Number.isFinite(maxAltitude)
    ? Math.max(maxAltitude * Y_AXIS_PADDING_RATIO, Y_AXIS_MIN_UPPER_BOUND)
    : Y_AXIS_MIN_UPPER_BOUND;
  const step = yAxisStep(target);
  const upperBound = Math.ceil(target / step) * step;

  const ticks: number[] = [];
  for (let i = 0; i <= upperBound; i += step) {
    ticks.push(i);
  }

  return { domain: [0, upperBound], ticks };
}

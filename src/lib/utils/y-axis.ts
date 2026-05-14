const MIN_Y_AXIS_MAX = 1000;
const Y_AXIS_STEP = 200;

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

export function computeYAxisConfig(maxAltitude: number): YAxisConfig {
  let upperBound: number;

  if (maxAltitude <= MIN_Y_AXIS_MAX) {
    upperBound = MIN_Y_AXIS_MAX;
  } else {
    upperBound = Math.ceil((maxAltitude + 1) / Y_AXIS_STEP) * Y_AXIS_STEP;
  }

  const ticks: number[] = [];
  for (let i = 0; i <= upperBound; i += Y_AXIS_STEP) {
    ticks.push(i);
  }

  return { domain: [0, upperBound], ticks };
}

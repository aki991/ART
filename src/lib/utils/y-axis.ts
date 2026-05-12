const MIN_Y_AXIS_MAX = 1000;
const Y_AXIS_STEP = 200;

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

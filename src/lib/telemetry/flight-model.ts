const TAKEOFF_DURATION_S = 120;
const CRUISE_MIN = 2900;
const CRUISE_MAX = 3100;

let activeCruiseTargets: Record<string, number> = {};
let pigeonOffsets: Record<string, number> = {};

export function setActiveRacePigeons(pigeonIds: string[]): void {
  activeCruiseTargets = {};
  pigeonOffsets = {};
  for (const id of pigeonIds) {
    activeCruiseTargets[id] = CRUISE_MIN + Math.random() * (CRUISE_MAX - CRUISE_MIN);
    pigeonOffsets[id] = Math.random() * Math.PI * 2;
  }
}

export function clearActivePigeons(): void {
  activeCruiseTargets = {};
  pigeonOffsets = {};
}

export function computeAltitudes(elapsedSeconds: number): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [pigeonId, target] of Object.entries(activeCruiseTargets)) {
    if (elapsedSeconds < TAKEOFF_DURATION_S) {
      const progress = elapsedSeconds / TAKEOFF_DURATION_S;
      const easedProgress = 1 - Math.pow(1 - progress, 2);
      result[pigeonId] = Math.max(0, target * easedProgress);
    } else {
      const offset = pigeonOffsets[pigeonId] ?? 0;
      const turbulence = Math.sin(elapsedSeconds * 0.3 + offset) * 8;
      const drift = Math.sin(elapsedSeconds * 0.05 + offset) * 15;
      result[pigeonId] = target + turbulence + drift;
    }
  }
  return result;
}

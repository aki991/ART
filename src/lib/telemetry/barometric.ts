/** Internacionalna barometrijska formula. Vraća visinu u metrima iznad
 *  nivoa na kom je izmeren referentni pritisak p0. */
export function altitudeFromPressure(pressurePa: number, refPressurePa: number): number {
  if (!Number.isFinite(pressurePa) || !Number.isFinite(refPressurePa)) return 0;
  if (pressurePa <= 0 || refPressurePa <= 0) return 0;
  return 44330 * (1 - Math.pow(pressurePa / refPressurePa, 0.1903));
}

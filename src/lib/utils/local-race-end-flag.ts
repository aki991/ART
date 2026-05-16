/**
 * Module-level singleton flag that stays true between handleEndRace (in
 * SimulationControls) and the lifecycle poll (in ScanningClient).
 *
 * Pošto handleEndRace i lifecycle poll žive u različitim komponentama, useRef
 * unutar jedne komponente ne može da se podeli. Modul-level promenljiva igra
 * ulogu zajedničkog ref-a: setuje se true u trenutku kad ovaj browser sam
 * završava trku, ostaje true sve dok se novi race ne pokrene (clearLocalEnd
 * iz handleStartRace) ili dok se stranica ne osveži.
 */

let localEnded = false;

export function markLocalEnd(): void {
  localEnded = true;
}

export function clearLocalEnd(): void {
  localEnded = false;
}

export function isLocalEnded(): boolean {
  return localEnded;
}

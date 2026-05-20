import { useConnectionStore } from "./connection-store";
import { useLiveRaceStore } from "./live-race-store";
import { useEmulatorStore } from "./emulator-store";
import { useProgrammerStore } from "./programmer-store";
import { useSettingsStore } from "./settings-store";
import { useSidebarStore } from "./sidebar-store";
import { SIMULATOR_STORAGE_PREFIX } from "@/lib/hooks/useRaceSimulator";

// Fiksni localStorage ključevi koje zustand persist middleware drži.
const PERSISTED_STORAGE_KEYS = [
  "art-emulator-slots",
  "art-session-programs-v2",
  "art-settings",
  "art-sidebar",
  "art-race-competition-type",
];

/**
 * Resetuje SVE Zustand store-ove na initial state i briše njihov persist
 * storage iz localStorage-a. Poziva se pri logout-u i brisanju naloga da
 * sledeći korisnik u istom browseru ne nasledi stanje prethodnog.
 */
export function clearAllStores(): void {
  // 1. In-memory reset — pokriva i ne-persistovane store-ove (connection,
  //    live-race) čiji state preživi client-side navigaciju posle logout-a.
  useConnectionStore.getState().reset();
  useLiveRaceStore.getState().clear();
  useEmulatorStore.getState().reset();
  useProgrammerStore.getState().reset();
  useSettingsStore.getState().reset();
  useSidebarStore.getState().reset();

  // 2. Brisanje localStorage-a — reset() iznad bi persist storage samo
  //    prepisao initial vrednostima; ovde ga uklanjamo u potpunosti.
  if (typeof window === "undefined") return;
  try {
    for (const key of PERSISTED_STORAGE_KEYS) {
      window.localStorage.removeItem(key);
    }
    // Dinamički ključevi: jedan `race_simulator_<raceId>` po simuliranoj trci.
    for (let i = window.localStorage.length - 1; i >= 0; i--) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(SIMULATOR_STORAGE_PREFIX)) {
        window.localStorage.removeItem(key);
      }
    }
  } catch {
    /* localStorage nedostupan — ignoriši */
  }
}

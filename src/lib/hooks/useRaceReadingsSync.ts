"use client";

import { useEffect } from "react";
import { getRaceReadings } from "@/app/actions/races";
import { useConnectionStore } from "@/lib/store/connection-store";
import { useLiveRaceStore } from "@/lib/store/live-race-store";

const POLL_INTERVAL_MS = 2000;

/**
 * Polls the DB every ~2s for the active race's altitude_readings and pushes
 * them into the live-race-store. Runs in EVERY browser tab — the DB is the
 * single source of truth for altitudes.
 */
export function useRaceReadingsSync() {
  const raceActive = useConnectionStore((s) => s.raceActive);
  const raceId = useConnectionStore((s) => s.raceId);
  const setReadings = useLiveRaceStore((s) => s.setReadings);
  const clear = useLiveRaceStore((s) => s.clear);

  useEffect(() => {
    if (!raceActive || !raceId) {
      clear();
      return;
    }

    let cancelled = false;

    async function fetchNow() {
      // Skip if a local end-race flow is in progress — UI will unmount soon.
      if (useConnectionStore.getState().isEndingRace) return;
      const res = await getRaceReadings(raceId!);
      if (cancelled) return;
      if (useConnectionStore.getState().isEndingRace) return;
      if (res.success) setReadings(res.data);
    }

    void fetchNow();
    const interval = setInterval(fetchNow, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [raceActive, raceId, setReadings, clear]);
}

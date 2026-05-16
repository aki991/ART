"use client";

import { useEffect, useRef } from "react";
import { recordAltitudeBatch } from "@/app/actions/races";
import { useConnectionStore } from "@/lib/store/connection-store";
import {
  computeAltitudes,
  setActiveRacePigeons,
} from "@/lib/telemetry/flight-model";

const TICK_INTERVAL_MS = 5000;

export const SIMULATOR_STORAGE_PREFIX = "race_simulator_";

export function simulatorStorageKey(raceId: string): string {
  return `${SIMULATOR_STORAGE_PREFIX}${raceId}`;
}

export function isThisBrowserSimulator(raceId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(simulatorStorageKey(raceId)) === "owner";
  } catch {
    return false;
  }
}

export function claimSimulatorRole(raceId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(simulatorStorageKey(raceId), "owner");
  } catch {
    /* ignore */
  }
}

export function releaseSimulatorRole(raceId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(simulatorStorageKey(raceId));
  } catch {
    /* ignore */
  }
}

/**
 * Runs only in the browser tab that started the race (or claimed the simulator
 * role on resume). Every 5s computes altitudes via the local flight-model and
 * pushes a batch to the DB. Does NOT touch any UI state — the chart reads
 * from the DB via useRaceReadingsSync.
 */
export function useRaceSimulator() {
  const raceActive = useConnectionStore((s) => s.raceActive);
  const raceId = useConnectionStore((s) => s.raceId);
  const raceStartedAtMs = useConnectionStore((s) => s.raceStartedAtMs);
  const activeRacePigeons = useConnectionStore((s) => s.activeRacePigeons);
  const stoppedRef = useRef(false);

  useEffect(() => {
    if (!raceActive || !raceId || !raceStartedAtMs) return;
    if (activeRacePigeons.length === 0) return;
    if (!isThisBrowserSimulator(raceId)) return;

    stoppedRef.current = false;

    // Initialise the flight model with this race's pigeon ring IDs so the
    // altitude curves are stable for the lifetime of this simulator session.
    setActiveRacePigeons(activeRacePigeons.map((p) => p.id));

    async function tick() {
      if (stoppedRef.current) return;
      // Re-read every guard from the store on each tick — closure-captured
      // values may be stale relative to a concurrent handleEndRace.
      const live = useConnectionStore.getState();
      // Explicit raceActive check: catches the gap between finishRaceSession
      // (sync setState that flips raceActive→false) and the React re-render
      // that triggers useEffect cleanup (clearInterval). A tick fired in this
      // gap must see raceActive=false and bail before computing/sending.
      if (!live.raceActive) { stoppedRef.current = true; return; }
      if (live.isEndingRace) { stoppedRef.current = true; return; }
      if (live.raceId !== raceId) { stoppedRef.current = true; return; }
      if (!isThisBrowserSimulator(raceId!)) { stoppedRef.current = true; return; }

      const elapsedSeconds = Math.max(
        0,
        Math.floor((Date.now() - raceStartedAtMs!) / 1000)
      );
      const altitudes = computeAltitudes(elapsedSeconds);

      const entries = activeRacePigeons
        .map((p) => {
          const alt = altitudes[p.id];
          if (typeof alt !== "number") return null;
          return {
            pigeonId: p.pigeonId,
            altitude: Math.round(alt),
            elapsedSeconds,
          };
        })
        .filter(
          (x): x is { pigeonId: string; altitude: number; elapsedSeconds: number } =>
            x !== null
        );

      if (entries.length === 0) return;

      // Final guard right before the network call.
      if (useConnectionStore.getState().isEndingRace) { stoppedRef.current = true; return; }
      if (!isThisBrowserSimulator(raceId!)) { stoppedRef.current = true; return; }

      const res = await recordAltitudeBatch(raceId!, entries);
      if (!res.success) {
        // If the race is no longer active (e.g. ended in another tab), stop
        // ticking — there's nothing useful left to record.
        if (res.error === "Trka više nije aktivna.") {
          stoppedRef.current = true;
        }
      }
    }

    void tick();
    const interval = setInterval(tick, TICK_INTERVAL_MS);

    return () => {
      stoppedRef.current = true;
      clearInterval(interval);
    };
  }, [raceActive, raceId, raceStartedAtMs, activeRacePigeons]);
}

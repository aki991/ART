"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useConnectionStore,
  type ActiveRacePigeon,
} from "@/lib/store/connection-store";
import { ConnectionHub } from "./ConnectionHub";
import { LiveFlightDashboard } from "./LiveFlightDashboard";
import { PIGEON_COLOR_PALETTE } from "@/lib/utils/pigeon-palette";
import { getActiveRace } from "@/app/actions/races";
import { isThisBrowserSimulator } from "@/lib/hooks/useRaceSimulator";
import { isLocalEnded } from "@/lib/utils/local-race-end-flag";
import type { RaceWithDetails } from "@/lib/types/race";

interface ScanningClientProps {
  initialActiveRace: RaceWithDetails | null;
}

const RACE_LIFECYCLE_POLL_MS = 5000;

export function ScanningClient({ initialActiveRace }: ScanningClientProps) {
  const router = useRouter();
  const status = useConnectionStore((s) => s.status);
  const raceActive = useConnectionStore((s) => s.raceActive);
  const raceId = useConnectionStore((s) => s.raceId);
  const setStatus = useConnectionStore((s) => s.setStatus);
  const setDeviceInfo = useConnectionStore((s) => s.setDeviceInfo);
  const beginRaceSession = useConnectionStore((s) => s.beginRaceSession);
  const finishRaceSession = useConnectionStore((s) => s.finishRaceSession);
  const resumedRef = useRef(false);

  // ─── RESUME: ako server kaže da postoji aktivna trka, učitaj je u UI ───
  // Router Cache može da nam servira stari `initialActiveRace` (sa završene
  // trke) pri navigaciji nazad — zato pre beginRaceSession verifikujemo
  // svežim pozivom getActiveRace().
  useEffect(() => {
    if (resumedRef.current) return;
    if (!initialActiveRace) return;
    if (initialActiveRace.status !== "in_progress") return;
    if (raceActive) return;
    resumedRef.current = true;

    void (async () => {
      const fresh = await getActiveRace();
      if (
        !fresh.success ||
        !fresh.data ||
        fresh.data.id !== initialActiveRace.id
      ) {
        return;
      }

      const pigeons: ActiveRacePigeon[] = initialActiveRace.race_pigeons
        .filter((rp): rp is typeof rp & { pigeon_id: string } => rp.pigeon_id !== null)
        .map((rp, idx) => ({
          id: rp.programmed_ring_id ?? rp.id,
          pigeonId: rp.pigeon_id,
          racePigeonId: rp.id,
          name: rp.pigeon_full_ring_number,
          // rp.color je server-side dodeljen u startRace; fallback za stare
          // trke pre migracije 007 koje imaju color = NULL.
          color: rp.color ?? PIGEON_COLOR_PALETTE[idx % PIGEON_COLOR_PALETTE.length],
          pigeonColor: rp.pigeon_color,
        }));

      const startedAtMs = new Date(initialActiveRace.started_at).getTime();

      setStatus("connected");
      setDeviceInfo({
        deviceId: "ART-DEMO-001",
        firmwareVersion: "1.0.0",
        batteryPct: 87,
      });

      beginRaceSession({
        raceId: initialActiveRace.id,
        name: initialActiveRace.name,
        visibility: initialActiveRace.visibility,
        pigeons,
        startedAtMs,
      });
      // Note: we do NOT claim simulator role on resume — only the original
      // starter writes to the DB. This tab will just poll readings (or, if it
      // happens to be the same browser that started the race, the localStorage
      // flag from start time still says "owner" and the simulator hook picks
      // up automatically).
      void isThisBrowserSimulator;
    })();
  }, [initialActiveRace, raceActive, setStatus, setDeviceInfo, beginRaceSession]);

  // ─── MOUNT GUARD: ako je store nekim slučajem već "raceActive" ali baza
  // kaže drugačije (npr. trka je u međuvremenu završena), očisti odmah.
  useEffect(() => {
    void (async () => {
      const { raceActive: active, raceId: id } = useConnectionStore.getState();
      if (!active || !id) return;
      const fresh = await getActiveRace();
      if (!fresh.success) return;
      if (!fresh.data || fresh.data.id !== id) {
        finishRaceSession();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── LIFECYCLE POLL: kad se trka završi u drugom prozoru, sinhronizuj ───
  useEffect(() => {
    if (!raceActive || !raceId) return;
    let cancelled = false;

    const interval = setInterval(async () => {
      // Skip the tick entirely if this tab is itself ending the race —
      // otherwise we'd race against handleEndRace and fire a spurious
      // "Trka je završena u drugom prozoru" toast.
      if (useConnectionStore.getState().isEndingRace) return;

      const res = await getActiveRace();
      if (cancelled) return;
      // Re-check after await; handleEndRace may have completed in the meantime.
      if (useConnectionStore.getState().isEndingRace) return;
      const liveState = useConnectionStore.getState();
      if (!liveState.raceActive || liveState.raceId !== raceId) return;
      if (!res.success) return;

      const stillActive = res.data && res.data.id === raceId;
      if (!stillActive) {
        // If WE are the one that just ended this race (handleEndRace called
        // markLocalEnd), suppress the cross-tab toast — the green "Trka
        // završena" toast from handleEndRace is the correct UX. Still clean
        // up local state in case it lingered.
        const ownEnd = isLocalEnded();
        finishRaceSession();
        if (!ownEnd) {
          toast.info("Trka je završena u drugom prozoru");
        }
        router.refresh();
      }
    }, RACE_LIFECYCLE_POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [raceActive, raceId, finishRaceSession, router]);

  const connected = status === "connected";

  return (
    <div className="relative min-h-[calc(100vh-108px)] 2xl:h-[calc(100vh-120px)] 2xl:overflow-hidden px-4 xl:px-5 2xl:px-6 pt-4 xl:pt-5 2xl:pt-6 pb-6 xl:pb-6 2xl:pb-6">
      {connected ? <LiveFlightDashboard /> : <ConnectionHub />}
    </div>
  );
}

"use client";

/**
 * src/lib/hooks/useSerialTelemetry.ts
 *
 * Realni izvor telemetrije: #TLM frame-ovi sa serial porta → altitude_readings
 * u bazi, kroz ISTI recordAltitudeBatch koji koristi simulator. Grafik,
 * useRaceReadingsSync i live-race-store ostaju netaknuti.
 *
 * Ponaša se identično useRaceSimulator-u (iste guard provere, isti 5s batch),
 * samo je izvor visine pravi hardver umesto flight-model-a.
 *
 * Mapiranje prsten → golub:
 *   1. frame.ringId === activeRacePigeons[i].id (programmed_ring_id, 4-hex)
 *   2. FALLBACK: ako nema poklapanja a u trci je TAČNO JEDAN golub,
 *      frame ide na njega. (Hardverski ring ID se za sada ne poklapa sa
 *      ID-em generisanim u browseru — ovo omogućava dron test bez
 *      usklađivanja ID-eva. Za više golubova fallback ne važi.)
 */

import { useEffect, useRef } from "react";
import { recordAltitudeBatch } from "@/app/actions/races";
import { useConnectionStore } from "@/lib/store/connection-store";
import { isThisBrowserSimulator } from "@/lib/hooks/useRaceSimulator";
import {
  serialTransport,
  type TlmFrame,
} from "@/lib/transport/serial-transport";

const BATCH_INTERVAL_MS = 5000;
/** Frame stariji od ovoga se ne upisuje (veza pukla, podatak ustajao). */
const FRAME_STALE_MS = 15000;

function batteryMvToPct(mv: number): number {
  // Gruba LiPo aproksimacija: 3300 mV = 0%, 4200 mV = 100%
  return Math.max(0, Math.min(100, Math.round((mv - 3300) / 9)));
}

export function useSerialTelemetry() {
  const method = useConnectionStore((s) => s.method);
  const status = useConnectionStore((s) => s.status);
  const raceActive = useConnectionStore((s) => s.raceActive);
  const raceId = useConnectionStore((s) => s.raceId);
  const raceStartedAtMs = useConnectionStore((s) => s.raceStartedAtMs);
  const activeRacePigeons = useConnectionStore((s) => s.activeRacePigeons);

  const latestByRing = useRef(new Map<string, TlmFrame>());
  const stoppedRef = useRef(false);

  /* ------------------------------------------------------------------ *
   * 1) Prikupljanje frame-ova + osvežavanje baterije u deviceInfo.
   *    Radi čim je serial konekcija aktivna, i pre starta trke.
   * ------------------------------------------------------------------ */
  useEffect(() => {
    if (method !== "usb-c" || status !== "connected") return;

    const offFrame = serialTransport.onFrame((frame) => {
      latestByRing.current.set(frame.ringId, frame);

      // Prava baterija prstena u top baru umesto hardkodovane vrednosti.
      const st = useConnectionStore.getState();
      if (st.deviceInfo && frame.batteryMv > 0) {
        const pct = batteryMvToPct(frame.batteryMv);
        if (Math.abs(st.deviceInfo.batteryPct - pct) >= 2) {
          st.setDeviceInfo({ ...st.deviceInfo, batteryPct: pct });
        }
      }
    });

    const offDisc = serialTransport.onDisconnect(() => {
      latestByRing.current.clear();
      const st = useConnectionStore.getState();
      if (st.status === "connected" && st.method === "usb-c") {
        st.setError("Veza sa baznom stanicom je prekinuta (serial port zatvoren).");
      }
    });

    return () => {
      offFrame();
      offDisc();
    };
  }, [method, status]);

  /* ------------------------------------------------------------------ *
   * 2) Batch upis u bazu — ogledalo useRaceSimulator tick logike.
   * ------------------------------------------------------------------ */
  useEffect(() => {
    if (method !== "usb-c") return;
    if (!raceActive || !raceId || !raceStartedAtMs) return;
    if (activeRacePigeons.length === 0) return;
    if (!isThisBrowserSimulator(raceId)) return;

    stoppedRef.current = false;

    async function tick() {
      if (stoppedRef.current) return;

      const live = useConnectionStore.getState();
      if (!live.raceActive) { stoppedRef.current = true; return; }
      if (live.isEndingRace) { stoppedRef.current = true; return; }
      if (live.raceId !== raceId) { stoppedRef.current = true; return; }
      if (!isThisBrowserSimulator(raceId!)) { stoppedRef.current = true; return; }

      const elapsedSeconds = Math.max(
        0,
        Math.floor((Date.now() - raceStartedAtMs!) / 1000)
      );
      const now = Date.now();

      // Najnoviji frame po golubu (dedup po pigeonId — fallback može više
      // ring-ova da preslika na istog goluba).
      const byPigeon = new Map<string, TlmFrame>();
      for (const [ringId, frame] of latestByRing.current) {
        if (now - frame.receivedAt > FRAME_STALE_MS) continue;

        let pigeon = live.activeRacePigeons.find(
          (p) => p.id.toUpperCase() === ringId
        );
        if (!pigeon && live.activeRacePigeons.length === 1) {
          pigeon = live.activeRacePigeons[0]; // MVP fallback: jedan golub
        }
        if (!pigeon) continue;

        const prev = byPigeon.get(pigeon.pigeonId);
        if (!prev || frame.receivedAt > prev.receivedAt) {
          byPigeon.set(pigeon.pigeonId, frame);
        }
      }

      const entries = Array.from(byPigeon.entries()).map(
        ([pigeonId, frame]) => ({
          pigeonId,
          altitude: Math.round(frame.altitudeMeters),
          elapsedSeconds,
        })
      );

      if (entries.length === 0) return;

      if (useConnectionStore.getState().isEndingRace) {
        stoppedRef.current = true;
        return;
      }
      if (!isThisBrowserSimulator(raceId!)) {
        stoppedRef.current = true;
        return;
      }

      const res = await recordAltitudeBatch(raceId!, entries);
      if (!res.success && res.error === "Let više nije aktivan.") {
        stoppedRef.current = true;
      }
    }

    void tick();
    const interval = setInterval(tick, BATCH_INTERVAL_MS);

    return () => {
      stoppedRef.current = true;
      clearInterval(interval);
    };
  }, [method, raceActive, raceId, raceStartedAtMs, activeRacePigeons]);
}
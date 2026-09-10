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
 * Visina se NE uzima iz uređaja kad god je moguće: prsten alt_m računa
 * relativno na pritisak zapamćen pri SVOM boot-u, pa restart u letu pomeri
 * nulu i lomi krivu. Umesto toga aplikacija sama računa visinu iz sirovog
 * pritiska, sa referencom uzetom na startu leta. Ako firmware ne šalje
 * pritisak (pressurePa === 0), pada na stari alt_m.
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
import { altitudeFromPressure } from "@/lib/telemetry/barometric";
import { isThisBrowserSimulator } from "@/lib/hooks/useRaceSimulator";
import {
  serialTransport,
  type TlmFrame,
} from "@/lib/transport/serial-transport";

const BATCH_INTERVAL_MS = 5000;
/** Frame stariji od ovoga se ne upisuje (veza pukla, podatak ustajao). */
const FRAME_STALE_MS = 15000;

/** Broj uzoraka pritiska od kojih se uzima medijana za referentnu nulu. */
const REF_SAMPLE_COUNT = 5;

/** Medijana (ne prosek) — otporna na pojedinačni outlier pri startu. */
function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

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

  /** ringId -> referentni pritisak (Pa) uzet na startu leta. */
  const refPressureRef = useRef(new Map<string, number>());
  /** ringId -> uzorci pritiska dok se ne skupi REF_SAMPLE_COUNT. */
  const pressureSamplesRef = useRef(new Map<string, number[]>());
  /** ringId-ovi za koje je režim već ispisan u konzolu. */
  const modeLoggedRef = useRef(new Set<string>());

  /* ------------------------------------------------------------------ *
   * 1) Prikupljanje frame-ova + osvežavanje baterije u deviceInfo.
   *    Radi čim je serial konekcija aktivna, i pre starta trke.
   * ------------------------------------------------------------------ */
  useEffect(() => {
    if (method !== "usb-c" || status !== "connected") return;

    const offFrame = serialTransport.onFrame((frame) => {
      latestByRing.current.set(frame.ringId, frame);

      const st = useConnectionStore.getState();

      // Referentna nula: medijana prvih REF_SAMPLE_COUNT validnih uzoraka
      // pritiska NAKON starta leta. Dok se ne skupi, taj prsten se ne upisuje.
      if (
        st.raceActive &&
        frame.pressurePa > 0 &&
        !refPressureRef.current.has(frame.ringId)
      ) {
        const samples = pressureSamplesRef.current.get(frame.ringId) ?? [];
        samples.push(frame.pressurePa);
        pressureSamplesRef.current.set(frame.ringId, samples);
        if (samples.length >= REF_SAMPLE_COUNT) {
          refPressureRef.current.set(frame.ringId, median(samples));
          pressureSamplesRef.current.delete(frame.ringId);
        }
      }

      // Prava baterija prstena u top baru umesto hardkodovane vrednosti.
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
   * 1b) Reset referentne nule na kraju leta i pri promeni trke.
   *     Kod resume-a leta reference se uzimaju ponovo iz prvih uzoraka —
   *     nula tada ostaje na tekućem nivou, što je prihvatljivo jer je
   *     restart aplikacije usred leta redak slučaj.
   * ------------------------------------------------------------------ */
  useEffect(() => {
    const clearRefs = () => {
      refPressureRef.current.clear();
      pressureSamplesRef.current.clear();
      modeLoggedRef.current.clear();
    };
    if (!raceActive || !raceId) clearRefs();
    return clearRefs;
  }, [raceActive, raceId]);

  /* ------------------------------------------------------------------ *
   * 2) Batch upis u bazu — ogledalo useRaceSimulator tick logike.
   * ------------------------------------------------------------------ */
  useEffect(() => {
    if (method !== "usb-c") return;
    if (!raceActive || !raceId || !raceStartedAtMs) return;
    if (activeRacePigeons.length === 0) return;
    if (!isThisBrowserSimulator(raceId)) return;

    stoppedRef.current = false;

    function logModeOnce(ringId: string, mode: string) {
      if (modeLoggedRef.current.has(ringId)) return;
      modeLoggedRef.current.add(ringId);
      console.info(`[telemetry] prsten ${ringId}: visina iz ${mode}`);
    }

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

      const entries: {
        pigeonId: string;
        altitude: number;
        elapsedSeconds: number;
      }[] = [];

      for (const [pigeonId, frame] of byPigeon) {
        const ref = refPressureRef.current.get(frame.ringId);
        let altitude: number;

        if (frame.pressurePa > 0) {
          // Referenca se još skuplja — preskoči, ne upisuj pogrešnu nulu.
          if (ref === undefined) continue;
          altitude = Math.round(altitudeFromPressure(frame.pressurePa, ref));
          logModeOnce(frame.ringId, `pritisak (ref ${Math.round(ref)} Pa)`);
        } else {
          altitude = Math.round(frame.altitudeMeters);
          logModeOnce(frame.ringId, "fallback na alt_m sa uređaja");
        }

        entries.push({ pigeonId, altitude, elapsedSeconds });
      }

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
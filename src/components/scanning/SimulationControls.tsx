"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Square, Unplug, Lock, Users, Globe, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useConnectionStore, type ActiveRacePigeon } from "@/lib/store/connection-store";
import { useProgrammerStore } from "@/lib/store/programmer-store";
import { searchMyPigeons } from "@/app/actions/pigeons";
import { startRace, endRace } from "@/app/actions/races";
import { getCurrentUserClub } from "@/app/actions/clubs";
import {
  claimSimulatorRole,
  releaseSimulatorRole,
} from "@/lib/hooks/useRaceSimulator";
import {
  clearLocalEnd,
  markLocalEnd,
} from "@/lib/utils/local-race-end-flag";
import type { RaceVisibility } from "@/lib/types/race";

const VISIBILITY_OPTIONS: Array<{
  value: RaceVisibility;
  label: string;
  Icon: typeof Lock;
  description: string;
}> = [
  {
    value: "private",
    label: "Privatno",
    Icon: Lock,
    description: "Samo vi vidite ovu trku.",
  },
  {
    value: "club",
    label: "Klub",
    Icon: Users,
    description: "Članovi vašeg kluba mogu da vide rezultate.",
  },
  {
    value: "public",
    label: "Javno",
    Icon: Globe,
    description: "Svi korisnici aplikacije mogu da vide ovu trku.",
  },
];

export function SimulationControls() {
  const router = useRouter();
  const raceActive = useConnectionStore((s) => s.raceActive);
  const raceName = useConnectionStore((s) => s.raceName);
  const raceVisibility = useConnectionStore((s) => s.raceVisibility);
  const raceId = useConnectionStore((s) => s.raceId);
  const setRaceName = useConnectionStore((s) => s.setRaceName);
  const setRaceVisibility = useConnectionStore((s) => s.setRaceVisibility);
  const beginRaceSession = useConnectionStore((s) => s.beginRaceSession);
  const finishRaceSession = useConnectionStore((s) => s.finishRaceSession);
  const markEndingRace = useConnectionStore((s) => s.markEndingRace);
  const clearEndingRace = useConnectionStore((s) => s.clearEndingRace);
  const disconnect = useConnectionStore((s) => s.disconnect);

  const sessionPrograms = useProgrammerStore((s) => s.sessionPrograms);
  const clearProgrammerSession = useProgrammerStore((s) => s.clearSession);

  const [hasClub, setHasClub] = useState<boolean | null>(null);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getCurrentUserClub().then((res) => {
      if (cancelled) return;
      if (res.success) setHasClub(res.data !== null);
      else setHasClub(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const hasPigeons = sessionPrograms.length > 0;
  const hasName = raceName.trim().length > 0;
  const canStart = hasPigeons && hasName && !starting;

  async function handleStartRace() {
    if (!canStart) return;
    // Reset stale "I just ended a race" flag from a previous lifecycle so the
    // new race's lifecycle poll behaves normally.
    clearLocalEnd();
    setStarting(true);
    try {
      const resolved: Array<{
        ringId: string;
        slot: number | null;
        pigeonId: string;
        full_ring_number: string;
        color: string;
        ringColor: string;
      }> = [];

      for (const sp of sessionPrograms) {
        const lookup = await searchMyPigeons(sp.pigeonIdentifier);
        if (!lookup.success) {
          toast.error("Greška pri učitavanju golubova", { description: lookup.error });
          setStarting(false);
          return;
        }
        const match = lookup.data.find(
          (p) => p.full_ring_number === sp.pigeonIdentifier
        );
        if (!match) {
          toast.error("Golub nije pronađen", {
            description: `${sp.pigeonIdentifier} nije u bazi. Dodaj ga na stranici Golubovi.`,
          });
          setStarting(false);
          return;
        }
        resolved.push({
          ringId: sp.ringId,
          slot: null,
          pigeonId: match.id,
          full_ring_number: match.full_ring_number,
          color: match.color,
          ringColor: sp.ringColor,
        });
      }

      const res = await startRace({
        name: raceName.trim(),
        visibility: raceVisibility,
        programmedRings: resolved.map((r) => ({
          ringId: r.ringId,
          slot: r.slot,
          pigeonId: r.pigeonId,
        })),
      });

      if (!res.success) {
        toast.error("Trka nije pokrenuta", { description: res.error });
        setStarting(false);
        return;
      }

      const pigeons: ActiveRacePigeon[] = resolved.map((r) => {
        const mapped = res.data.ringPigeonMap.find((m) => m.ringId === r.ringId);
        return {
          id: r.ringId,
          pigeonId: r.pigeonId,
          racePigeonId: mapped?.racePigeonId ?? "",
          name: r.full_ring_number,
          color: r.ringColor,
          pigeonColor: r.color,
        };
      });

      // Mark THIS browser as the authoritative simulator for this race.
      // Other tabs/browsers will only read from the DB.
      claimSimulatorRole(res.data.raceId);

      beginRaceSession({
        raceId: res.data.raceId,
        name: raceName.trim(),
        visibility: raceVisibility,
        pigeons,
        startedAtMs: Date.now(),
      });

      toast.success("Trka pokrenuta");
    } finally {
      setStarting(false);
    }
  }

  async function handleEndRace() {
    if (!raceId || ending) return;
    const idBeingEnded = raceId;

    // 1. SYNCHRONOUSLY mark "this browser is the one ending the race" + flip
    //    the Zustand ending flag BEFORE anything else. The lifecycle poll in
    //    ScanningClient checks isLocalEnded() before showing the cross-tab
    //    toast, eliminating the false "Trka je završena u drugom prozoru"
    //    that fired when our own finishRaceSession() cleared isEndingRace.
    markLocalEnd();
    markEndingRace();
    releaseSimulatorRole(idBeingEnded);
    setEnding(true);

    try {
      const res = await endRace(idBeingEnded);
      if (!res.success) {
        toast.error("Završetak nije uspeo", { description: res.error });
        clearEndingRace();
        setEnding(false);
        return;
      }

      // 2. Wipe local state (clears live-race readings, connection store).
      finishRaceSession();
      clearProgrammerSession();

      toast.success("Trka završena");
      // 3. Navigate to results, then invalidate Router Cache so a later return
      //    to /scanning re-fetches fresh server data (no ghost render).
      router.push(`/races/${res.data.raceId}`);
      router.refresh();
    } catch (err) {
      toast.error("Završetak nije uspeo", {
        description: err instanceof Error ? err.message : "Pokušajte ponovo.",
      });
      clearEndingRace();
      setEnding(false);
    }
  }

  return (
    <div className="card-redesign p-6">
      <p className="text-sm uppercase tracking-widest text-text-tertiary mb-3">
        Kontrole
      </p>

      <div className="space-y-3">
        {!raceActive ? (
          <>
            <div>
              <label className="block text-xs uppercase tracking-widest text-text-tertiary font-medium mb-1.5">
                Vidljivost trke
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {VISIBILITY_OPTIONS.map(({ value, label, Icon }) => {
                  const isActive = raceVisibility === value;
                  const isClubDisabled = value === "club" && hasClub === false;
                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={isClubDisabled}
                      onClick={() => setRaceVisibility(value)}
                      title={
                        isClubDisabled
                          ? "Pristupite klubu u Postavkama da omogućite ovu opciju"
                          : undefined
                      }
                      className={cn(
                        "flex flex-col items-center gap-1 px-2 py-2.5 rounded-md text-xs font-medium border transition-colors",
                        isActive
                          ? "bg-accent-light border-accent text-accent"
                          : "bg-bg-input border-border text-text-secondary hover:bg-bg-hover",
                        isClubDisabled && "opacity-40 cursor-not-allowed hover:bg-bg-input"
                      )}
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                      {label}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-text-tertiary mt-1.5">
                {VISIBILITY_OPTIONS.find((o) => o.value === raceVisibility)?.description}
              </p>
            </div>

            <div>
              <label
                htmlFor="race-name-input"
                className="block text-xs uppercase tracking-widest text-text-tertiary font-medium mb-1.5"
              >
                Naziv trke *
              </label>
              <input
                id="race-name-input"
                type="text"
                value={raceName}
                onChange={(e) => setRaceName(e.target.value)}
                maxLength={50}
                placeholder="npr. Subotica - Beograd"
                className="w-full px-3 py-2 bg-bg-input border border-border rounded-md text-sm text-text-primary placeholder:text-text-disabled focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleStartRace}
              disabled={!canStart}
              className="w-full px-4 py-3 rounded-md text-base font-medium transition-colors inline-flex items-center justify-center gap-2 bg-status-success hover:bg-status-success/90 text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {starting ? (
                <Loader2 size={20} className="animate-spin" aria-hidden="true" />
              ) : (
                <Play size={20} aria-hidden="true" />
              )}
              {starting ? "Pokretanje..." : "Start trke"}
            </button>

            {!canStart && !starting && (
              <p className="text-xs text-text-disabled text-center">
                {!hasPigeons
                  ? "Programiraj bar 1 prsten da bi pokrenuo trku"
                  : "Unesi naziv trke da pokreneš"}
              </p>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={handleEndRace}
            disabled={ending}
            className="w-full px-4 py-3 rounded-md text-base font-medium transition-colors inline-flex items-center justify-center gap-2 bg-status-warning hover:bg-status-warning/90 text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {ending ? (
              <Loader2 size={20} className="animate-spin" aria-hidden="true" />
            ) : (
              <Square size={20} aria-hidden="true" />
            )}
            {ending ? "Završavanje..." : "Završi trku"}
          </button>
        )}

        <button
          type="button"
          onClick={() => void disconnect()}
          className="w-full px-4 py-3 rounded-md text-base font-medium transition-colors inline-flex items-center justify-center gap-2 bg-bg-error-light text-status-error border border-status-error/30 hover:bg-status-error/20"
        >
          <Unplug size={20} aria-hidden="true" />
          Diskonektuj
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Square, Unplug, Lock, Users, Globe, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useConnectionStore, type ActiveRacePigeon } from "@/lib/store/connection-store";
import { useProgrammerStore } from "@/lib/store/programmer-store";
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

const MIN_PIGEONS_FOR_COMPETITION = 5;
const COMPETITION_TYPE_STORAGE_KEY = "art-race-competition-type";

const COMPETITION_TYPES: Array<{
  value: string;
  label: string;
  requiresMinimum: boolean;
}> = [
  { value: "drustveno_seniori", label: "Društveno seniori", requiresMinimum: true },
  { value: "kup_drustva", label: "Kup društva", requiresMinimum: true },
  { value: "drustveno_juniori", label: "Društveno juniori", requiresMinimum: true },
  { value: "trening", label: "Trening", requiresMinimum: false },
];

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
    label: "Društvo",
    Icon: Users,
    description: "Članovi vašeg društva mogu da vide rezultate.",
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
  const [competitionType, setCompetitionTypeState] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(COMPETITION_TYPE_STORAGE_KEY);
      if (stored && COMPETITION_TYPES.some((t) => t.value === stored)) {
        setCompetitionTypeState(stored);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setCompetitionType = (val: string | null) => {
    setCompetitionTypeState(val);
    try {
      if (val) window.localStorage.setItem(COMPETITION_TYPE_STORAGE_KEY, val);
      else window.localStorage.removeItem(COMPETITION_TYPE_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

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

  const visibleVisibilityOptions = useMemo(
    () =>
      VISIBILITY_OPTIONS.filter(
        (opt) => !(opt.value === "club" && hasClub === false)
      ),
    [hasClub]
  );

  useEffect(() => {
    if (hasClub === false && raceVisibility === "club") {
      setRaceVisibility("private");
    }
  }, [hasClub, raceVisibility, setRaceVisibility]);

  const selectedCompetition = COMPETITION_TYPES.find(
    (c) => c.value === competitionType
  );
  const pigeonCount = sessionPrograms.length;
  const hasPigeons = pigeonCount > 0;
  const hasEnoughPigeons = selectedCompetition
    ? selectedCompetition.requiresMinimum
      ? pigeonCount >= MIN_PIGEONS_FOR_COMPETITION
      : hasPigeons
    : false;
  const canStart = !!selectedCompetition && hasEnoughPigeons && !starting;

  async function handleStartRace() {
    if (!canStart || !selectedCompetition) return;
    // Reset stale "I just ended a race" flag from a previous lifecycle so the
    // new race's lifecycle poll behaves normally.
    clearLocalEnd();
    setStarting(true);
    try {
      // PigeonForm upisuje pigeonId (DB UUID) direktno pri programiranju
      // prstena — bilo iz dropdown-a (pravi golub), bilo iz findOrCreate-
      // ArchivedPigeon (ručno unet broj alkice). Ovde više nije potrebno
      // tražiti goluba po full_ring_number pre starta trke.
      const resolved = sessionPrograms.map((sp) => ({
        ringId: sp.ringId,
        slot: null as number | null,
        pigeonId: sp.pigeonId,
        full_ring_number: sp.pigeonIdentifier,
        color: sp.pigeonColor,
        ringColor: sp.ringColor,
      }));

      const raceLabel = selectedCompetition.label;
      setRaceName(raceLabel);

      const res = await startRace({
        name: raceLabel,
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
          // Boja linije dolazi iz baze (race_pigeons.color, server-side
          // dodeljena pri startRace) — tako svi browseri za istu trku
          // prikazuju identične boje.
          color: mapped?.color ?? r.ringColor,
          pigeonColor: r.color,
        };
      });

      // Mark THIS browser as the authoritative simulator for this race.
      // Other tabs/browsers will only read from the DB.
      claimSimulatorRole(res.data.raceId);

      beginRaceSession({
        raceId: res.data.raceId,
        name: raceLabel,
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
    <div className="card-redesign p-3 xl:p-4 2xl:p-6">
      <p className="text-[10px] xl:text-xs 2xl:text-sm uppercase tracking-widest text-text-tertiary mb-2 xl:mb-2.5 2xl:mb-3">
        Kontrole
      </p>

      <div className="space-y-2 xl:space-y-2.5 2xl:space-y-3">
        {!raceActive ? (
          <>
            <div>
              <label className="block text-xs uppercase tracking-widest text-text-tertiary font-medium mb-1.5">
                Vidljivost trke
              </label>
              <div
                className={cn(
                  "grid gap-1.5",
                  visibleVisibilityOptions.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-3"
                )}
              >
                {visibleVisibilityOptions.map(({ value, label, Icon }) => {
                  const isActive = raceVisibility === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRaceVisibility(value)}
                      className={cn(
                        "flex flex-col items-center gap-1 px-2 py-2.5 rounded-md text-xs font-medium border transition-colors",
                        isActive
                          ? "bg-accent-light border-accent text-accent"
                          : "bg-bg-input border-border text-text-secondary hover:bg-bg-hover"
                      )}
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                      {label}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-text-tertiary mt-1.5">
                {visibleVisibilityOptions.find((o) => o.value === raceVisibility)?.description}
              </p>
            </div>

            <div>
              <span className="block text-xs uppercase tracking-widest text-text-tertiary font-medium mb-1.5">
                Vrsta takmičenja *
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {COMPETITION_TYPES.map(({ value, label }) => {
                  const isActive = competitionType === value;
                  return (
                    <label
                      key={value}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-md border text-sm cursor-pointer transition-colors",
                        isActive
                          ? "bg-accent-light border-accent text-accent"
                          : "bg-bg-input border-border text-text-secondary hover:bg-bg-hover"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={() =>
                          setCompetitionType(isActive ? null : value)
                        }
                        className="w-4 h-4 accent-accent cursor-pointer flex-shrink-0"
                      />
                      <span className="flex-1 truncate">{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartRace}
              disabled={!canStart}
              className="w-full px-3 xl:px-3.5 2xl:px-4 py-2.5 xl:py-2.5 2xl:py-3 rounded-md text-sm xl:text-sm 2xl:text-base font-medium transition-colors inline-flex items-center justify-center gap-2 bg-status-success hover:bg-status-success/90 text-white disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
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
                {!selectedCompetition
                  ? "Izaberi vrstu takmičenja da pokreneš trku"
                  : selectedCompetition.requiresMinimum && !hasEnoughPigeons
                    ? `Za "${selectedCompetition.label}" potrebno je najmanje ${MIN_PIGEONS_FOR_COMPETITION} golubova (programirano ${pigeonCount})`
                    : "Programiraj bar 1 prsten da bi pokrenuo trku"}
              </p>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={handleEndRace}
            disabled={ending}
            className="w-full px-3 xl:px-3.5 2xl:px-4 py-2.5 xl:py-2.5 2xl:py-3 rounded-md text-sm xl:text-sm 2xl:text-base font-medium transition-colors inline-flex items-center justify-center gap-2 bg-status-warning hover:bg-status-warning/90 text-white disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
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
          className="w-full px-3 xl:px-3.5 2xl:px-4 py-2.5 xl:py-2.5 2xl:py-3 rounded-md text-sm xl:text-sm 2xl:text-base font-medium transition-colors inline-flex items-center justify-center gap-2 bg-bg-error-light text-status-error border border-status-error/30 hover:bg-status-error/20 whitespace-nowrap"
        >
          <Unplug size={20} aria-hidden="true" />
          Diskonektuj
        </button>
      </div>
    </div>
  );
}

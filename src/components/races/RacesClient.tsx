"use client";

import { useEffect, useState, useTransition } from "react";
import { Trophy, Loader2, Lock, Users, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getVisibleRaces, getLiveRaces, type LiveRace } from "@/app/actions/races";
import { createClient } from "@/lib/supabase/client";
import type { RaceListItem, RaceVisibility } from "@/lib/types/race";

type Filter = "live" | "mine" | "club" | "public" | "all";

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: "live", label: "Uživo" },
  { value: "mine", label: "Moje" },
  { value: "club", label: "Društvo" },
  { value: "public", label: "Javne" },
  { value: "all", label: "Sve" },
];

const VISIBILITY_META: Record<RaceVisibility, { Icon: typeof Lock; label: string }> = {
  private: { Icon: Lock, label: "Privatno" },
  club: { Icon: Users, label: "Društvo" },
  public: { Icon: Globe, label: "Javno" },
};

interface RacesClientProps {
  initialRaces: RaceListItem[];
}

export function RacesClient({ initialRaces }: RacesClientProps) {
  const [filter, setFilter] = useState<Filter>("mine");
  const [races, setRaces] = useState<RaceListItem[]>(initialRaces);
  const [pending, startTransition] = useTransition();
  const [liveRaces, setLiveRaces] = useState<LiveRace[]>([]);
  const [liveLoaded, setLiveLoaded] = useState(false);

  // Realtime subscription na 'races' tabelu — instant update kad neki golubar
  // pokrene/završi let (RLS automatski filtrira po vidljivosti). Refetch celu
  // listu pri bilo kakvoj promeni — jednostavnije nego pratiti pojedinačne
  // INSERT/UPDATE/DELETE eventove. Badge count se osvežava globalno (nezavisno
  // od trenutno aktivnog taba).
  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function refetchLive() {
      const res = await getLiveRaces();
      if (cancelled) return;
      if (res.success) setLiveRaces(res.data);
      setLiveLoaded(true);
    }

    void refetchLive();

    const channel = supabase
      .channel("live-races-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "races" },
        () => {
          void refetchLive();
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, []);

  function changeFilter(next: Filter) {
    if (next === filter) return;
    setFilter(next);
    if (next === "live") return; // LiveRacesTab koristi prosleđen state
    startTransition(async () => {
      const res = await getVisibleRaces(next);
      if (res.success) setRaces(res.data);
    });
  }

  const liveCount = liveRaces.length;

  return (
    <div className="px-4 xl:px-5 2xl:px-6 py-4 xl:py-5 2xl:py-6 space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => {
          const isActive = filter === f.value;
          const isLive = f.value === "live";
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => changeFilter(f.value)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 xl:px-3.5 2xl:px-4 py-2 rounded-md text-sm xl:text-sm 2xl:text-base font-medium transition-colors whitespace-nowrap",
                isActive
                  ? "bg-accent text-text-on-accent"
                  : "bg-bg-surface border border-border text-text-secondary hover:bg-bg-hover"
              )}
            >
              {isLive && liveCount > 0 && (
                <span
                  className="w-2 h-2 rounded-full bg-status-error animate-pulse"
                  aria-hidden="true"
                />
              )}
              {f.label}
              {isLive && liveCount > 0 && (
                <span className="text-xs opacity-80">({liveCount})</span>
              )}
            </button>
          );
        })}
        {pending && (
          <Loader2 className="w-4 h-4 animate-spin text-text-tertiary" aria-hidden="true" />
        )}
      </div>

      {filter === "live" ? (
        <LiveRacesTab liveRaces={liveRaces} loaded={liveLoaded} />
      ) : races.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <ResultsTable races={races} />
      )}
    </div>
  );
}

function LiveRacesTab({
  liveRaces,
  loaded,
}: {
  liveRaces: LiveRace[];
  loaded: boolean;
}) {
  const router = useRouter();
  const [now, setNow] = useState(() => Date.now());

  // Real-time trajanje: tikira svake sekunde da bi se trajanje računalo iz now.
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!loaded) {
    return (
      <div className="bg-bg-surface border border-accent/15 rounded-xl p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-text-tertiary mx-auto" aria-hidden="true" />
      </div>
    );
  }

  if (liveRaces.length === 0) {
    return (
      <div className="bg-bg-surface border border-accent/15 rounded-xl p-12 text-center">
        <Trophy className="w-16 h-16 text-text-disabled mx-auto mb-4" aria-hidden="true" />
        <h2 className="text-2xl font-bold text-text-primary mb-2 font-rajdhani">
          Trenutno nema aktivnih letova
        </h2>
        <p className="text-text-tertiary">
          Čim neki golubar pokrene let koji možete da vidite, pojaviće se ovde.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-bg-surface border border-accent/15 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="table-header-gradient text-[10px] 2xl:text-xs uppercase text-text-tertiary font-medium">
            <tr>
              <th className="text-left py-3 px-2 2xl:px-4 whitespace-nowrap">Vrsta takmičenja</th>
              <th className="text-left py-3 px-2 2xl:px-4 whitespace-nowrap">Golubar</th>
              <th className="text-left py-3 px-2 2xl:px-4 whitespace-nowrap">Društvo</th>
              <th className="text-left py-3 px-2 2xl:px-4 whitespace-nowrap">Početak</th>
              <th className="text-left py-3 px-2 2xl:px-4 whitespace-nowrap">Trajanje</th>
              <th className="text-left py-3 px-2 2xl:px-4 whitespace-nowrap">Golubova</th>
              <th className="text-left py-3 px-2 2xl:px-4 whitespace-nowrap">Vidljivost</th>
            </tr>
          </thead>
          <tbody>
            {liveRaces.map((race) => {
              const startMs = new Date(race.started_at).getTime();
              const elapsedSec = Math.max(0, Math.floor((now - startMs) / 1000));
              const { Icon: VisIcon, label: visLabel } = VISIBILITY_META[race.visibility];
              const startTime = new Date(race.started_at).toLocaleTimeString("sr-RS", {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <tr
                  key={race.id}
                  onClick={() => router.push(`/races/${race.id}`)}
                  className="border-t border-border hover:bg-bg-hover cursor-pointer transition-colors text-xs 2xl:text-sm"
                >
                  <td className="py-3 px-2 2xl:py-4 2xl:px-4 text-text-primary font-medium whitespace-nowrap">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full bg-status-error animate-pulse"
                        aria-hidden="true"
                      />
                      {race.name}
                    </span>
                  </td>
                  <td className="py-3 px-2 2xl:py-4 2xl:px-4 text-text-secondary whitespace-nowrap">
                    {race.owner_name}
                  </td>
                  <td className="py-3 px-2 2xl:py-4 2xl:px-4 text-text-secondary whitespace-nowrap">
                    {race.club_name ?? "—"}
                  </td>
                  <td className="py-3 px-2 2xl:py-4 2xl:px-4 text-text-tertiary whitespace-nowrap">
                    {startTime}
                  </td>
                  <td className="py-3 px-2 2xl:py-4 2xl:px-4 text-accent font-semibold whitespace-nowrap">
                    {formatLiveDuration(elapsedSec)}
                  </td>
                  <td className="py-3 px-2 2xl:py-4 2xl:px-4 text-text-secondary whitespace-nowrap">
                    {race.pigeon_count}
                  </td>
                  <td className="py-3 px-2 2xl:py-4 2xl:px-4 text-text-tertiary whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5">
                      <VisIcon className="w-3.5 h-3.5" aria-hidden="true" />
                      {visLabel}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatLiveDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
  }
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

function EmptyState({ filter }: { filter: Filter }) {
  const message =
    filter === "mine"
      ? 'Pokrenite let iz "Let uživo" da bi se pojavili rezultati.'
      : filter === "club"
        ? "Nijedan klupski let još nije objavljen."
        : filter === "public"
          ? "Nema javnih letova."
          : "Nema vidljivih letova.";

  return (
    <div className="bg-bg-surface border border-accent/15 rounded-xl p-12 text-center">
      <Trophy className="w-16 h-16 text-text-disabled mx-auto mb-4" aria-hidden="true" />
      <h2 className="text-2xl font-bold text-text-primary mb-2 font-rajdhani">
        Još nema letova
      </h2>
      <p className="text-text-tertiary">{message}</p>
    </div>
  );
}

function ResultsTable({ races }: { races: RaceListItem[] }) {
  return (
    <div className="bg-bg-surface border border-accent/15 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="table-header-gradient text-[10px] 2xl:text-xs uppercase text-text-tertiary font-medium">
            <tr>
              <th className="text-left py-3 px-2 2xl:px-4 whitespace-nowrap">Vrsta takmičenja</th>
              <th className="text-left py-3 px-2 2xl:px-4 whitespace-nowrap">Golubar</th>
              <th className="text-left py-3 px-2 2xl:px-4 whitespace-nowrap">Društvo</th>
              <th className="text-left py-3 px-2 2xl:px-4 whitespace-nowrap">Trajanje</th>
              <th className="text-left py-3 px-2 2xl:px-4 whitespace-nowrap">Prosečna visina</th>
              <th className="text-left py-3 px-2 2xl:px-4 whitespace-nowrap">Max visina</th>
              <th className="text-left py-3 px-2 2xl:px-4 whitespace-nowrap">Datum</th>
              <th className="text-left py-3 px-2 2xl:px-4 whitespace-nowrap">Vidljivost</th>
              <th className="text-left py-3 px-2 2xl:px-4 whitespace-nowrap">Validna</th>
            </tr>
          </thead>
          <tbody>
            {races.map((race) => (
              <ResultRow key={race.id} race={race} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ResultRow({ race }: { race: RaceListItem }) {
  const router = useRouter();

  const dateStr = new Date(race.started_at).toLocaleDateString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const ownerName = race.owner_profile
    ? `${race.owner_profile.first_name} ${race.owner_profile.last_name}`.trim() ||
      race.owner_profile.username
    : "—";

  const clubLabel = race.club ? race.club.name : "—";
  const { Icon: VisIcon, label: visLabel } = VISIBILITY_META[race.visibility];

  return (
    <tr
      onClick={() => router.push(`/races/${race.id}`)}
      className="border-t border-border hover:bg-bg-hover cursor-pointer transition-colors text-xs 2xl:text-sm"
    >
      <td className="py-3 px-2 2xl:py-4 2xl:px-4 text-text-primary font-medium whitespace-nowrap">{race.name}</td>
      <td className="py-3 px-2 2xl:py-4 2xl:px-4 text-text-secondary whitespace-nowrap">{ownerName}</td>
      <td className="py-3 px-2 2xl:py-4 2xl:px-4 text-text-secondary whitespace-nowrap">{clubLabel}</td>
      <td className="py-3 px-2 2xl:py-4 2xl:px-4 text-text-secondary whitespace-nowrap">
        {race.duration_seconds != null ? formatDuration(race.duration_seconds) : "—"}
      </td>
      <td className="py-3 px-2 2xl:py-4 2xl:px-4 text-accent font-semibold whitespace-nowrap">
        {race.avg_altitude != null ? `${race.avg_altitude}m` : "—"}
      </td>
      <td className="py-3 px-2 2xl:py-4 2xl:px-4 text-accent font-semibold whitespace-nowrap">
        {race.max_altitude != null ? `${race.max_altitude}m` : "—"}
      </td>
      <td className="py-3 px-2 2xl:py-4 2xl:px-4 text-text-tertiary whitespace-nowrap">{dateStr}</td>
      <td className="py-3 px-2 2xl:py-4 2xl:px-4 text-text-tertiary whitespace-nowrap">
        <span className="inline-flex items-center gap-1.5">
          <VisIcon className="w-3.5 h-3.5" aria-hidden="true" />
          {visLabel}
        </span>
      </td>
      <td className="py-3 px-2 2xl:py-4 2xl:px-4 whitespace-nowrap">
        {race.status !== "completed" ? (
          <span className="text-status-warning font-medium">{race.status === "in_progress" ? "U toku" : "Otkazano"}</span>
        ) : race.is_valid ? (
          <span className="text-status-success font-medium">Validna</span>
        ) : (
          <span className="text-status-error font-medium">Nije validna</span>
        )}
      </td>
    </tr>
  );
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds}s`;
}

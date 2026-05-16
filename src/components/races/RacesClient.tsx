"use client";

import { useState, useTransition } from "react";
import { Trophy, Loader2, Lock, Users, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getVisibleRaces } from "@/app/actions/races";
import type { RaceListItem, RaceVisibility } from "@/lib/types/race";

type Filter = "mine" | "club" | "public" | "all";

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: "mine", label: "Moje" },
  { value: "club", label: "Klub" },
  { value: "public", label: "Javne" },
  { value: "all", label: "Sve" },
];

const VISIBILITY_META: Record<RaceVisibility, { Icon: typeof Lock; label: string }> = {
  private: { Icon: Lock, label: "Privatno" },
  club: { Icon: Users, label: "Klub" },
  public: { Icon: Globe, label: "Javno" },
};

interface RacesClientProps {
  initialRaces: RaceListItem[];
}

export function RacesClient({ initialRaces }: RacesClientProps) {
  const [filter, setFilter] = useState<Filter>("mine");
  const [races, setRaces] = useState<RaceListItem[]>(initialRaces);
  const [pending, startTransition] = useTransition();

  function changeFilter(next: Filter) {
    if (next === filter) return;
    setFilter(next);
    startTransition(async () => {
      const res = await getVisibleRaces(next);
      if (res.success) setRaces(res.data);
    });
  }

  return (
    <div className="px-6 py-6 space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => changeFilter(f.value)}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              filter === f.value
                ? "bg-accent text-text-on-accent"
                : "bg-bg-surface border border-border text-text-secondary hover:bg-bg-hover"
            )}
          >
            {f.label}
          </button>
        ))}
        {pending && (
          <Loader2 className="w-4 h-4 animate-spin text-text-tertiary" aria-hidden="true" />
        )}
      </div>

      {races.length === 0 ? <EmptyState filter={filter} /> : <ResultsTable races={races} />}
    </div>
  );
}

function EmptyState({ filter }: { filter: Filter }) {
  const message =
    filter === "mine"
      ? 'Pokrenite trku iz "Trka uživo" da bi se pojavili rezultati.'
      : filter === "club"
        ? "Nijedna klupska trka još nije objavljena."
        : filter === "public"
          ? "Nema javnih trka."
          : "Nema vidljivih trka.";

  return (
    <div className="bg-bg-surface border border-accent/15 rounded-xl p-12 text-center">
      <Trophy className="w-16 h-16 text-text-disabled mx-auto mb-4" aria-hidden="true" />
      <h2 className="text-2xl font-bold text-text-primary mb-2 font-rajdhani">
        Još nema rezultata
      </h2>
      <p className="text-text-tertiary">{message}</p>
    </div>
  );
}

function ResultsTable({ races }: { races: RaceListItem[] }) {
  return (
    <div className="bg-bg-surface border border-accent/15 rounded-xl overflow-hidden">
      <table className="w-full">
        <thead className="table-header-gradient text-xs uppercase text-text-tertiary font-medium">
          <tr>
            <th className="text-left py-3 px-4">Naziv</th>
            <th className="text-left py-3 px-4">Golubar</th>
            <th className="text-left py-3 px-4">Klub</th>
            <th className="text-left py-3 px-4">Trajanje</th>
            <th className="text-left py-3 px-4">Prosečna visina</th>
            <th className="text-left py-3 px-4">Max visina</th>
            <th className="text-left py-3 px-4">Datum</th>
            <th className="text-left py-3 px-4">Vidljivost</th>
            <th className="text-left py-3 px-4">Validna</th>
          </tr>
        </thead>
        <tbody>
          {races.map((race) => (
            <ResultRow key={race.id} race={race} />
          ))}
        </tbody>
      </table>
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
      className="border-t border-border hover:bg-bg-hover cursor-pointer transition-colors"
    >
      <td className="py-4 px-4 text-text-primary font-medium">{race.name}</td>
      <td className="py-4 px-4 text-text-secondary">{ownerName}</td>
      <td className="py-4 px-4 text-text-secondary">{clubLabel}</td>
      <td className="py-4 px-4 text-text-secondary font-mono">
        {race.duration_seconds != null ? formatDuration(race.duration_seconds) : "—"}
      </td>
      <td className="py-4 px-4 text-accent font-semibold">
        {race.avg_altitude != null ? `${race.avg_altitude}m` : "—"}
      </td>
      <td className="py-4 px-4 text-accent font-semibold">
        {race.max_altitude != null ? `${race.max_altitude}m` : "—"}
      </td>
      <td className="py-4 px-4 text-text-tertiary text-sm">{dateStr}</td>
      <td className="py-4 px-4 text-text-tertiary text-sm">
        <span className="inline-flex items-center gap-1.5">
          <VisIcon className="w-3.5 h-3.5" aria-hidden="true" />
          {visLabel}
        </span>
      </td>
      <td className="py-4 px-4">
        {race.status !== "completed" ? (
          <span className="text-xs text-status-warning font-medium">{race.status === "in_progress" ? "U toku" : "Otkazano"}</span>
        ) : race.is_valid ? (
          <span className="text-xs text-status-success font-medium">Validna</span>
        ) : (
          <span className="text-xs text-status-error font-medium">Nije validna</span>
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

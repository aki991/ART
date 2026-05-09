import { Trophy, MapPin, Calendar, Users } from "lucide-react";
import type { UpcomingRace } from "@/lib/mock/dashboard-data";
import { RaceCountdown } from "./RaceCountdown";

interface NextRaceCardProps {
  race: UpcomingRace;
}

export function NextRaceCard({ race }: NextRaceCardProps) {
  const formattedDate = race.releaseDate.toLocaleString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="card-redesign p-6">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-500 uppercase">
        <Trophy size={16} aria-hidden="true" />
        Sledeća trka
      </div>
      <h3 className="text-xl font-semibold font-rajdhani text-gradient-cyan mt-2">
        {race.name}
      </h3>
      <div className="flex items-center gap-2 text-sm text-gray-600 mt-3">
        <MapPin size={14} aria-hidden="true" />
        {race.releaseLocation}
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
        <Calendar size={14} aria-hidden="true" />
        {formattedDate}
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
        <Users size={14} aria-hidden="true" />
        {race.participantCount} učesnika
      </div>
      <div className="border-t border-cyan-brand/10 my-4" />
      <p className="text-xs uppercase text-gray-500">Do puštanja:</p>
      <RaceCountdown targetDate={race.releaseDate} />
    </div>
  );
}

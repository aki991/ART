"use client";

import { useEffect, useState } from "react";

interface RaceCountdownProps {
  targetDate: Date;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  started: boolean;
}

function getTimeLeft(targetDate: Date): TimeLeft {
  const diff = Math.max(0, targetDate.getTime() - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    started: diff === 0,
  };
}

export function RaceCountdown({ targetDate }: RaceCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft(targetDate));

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (timeLeft.started) {
    return <p className="text-sm font-rajdhani text-green-600 font-medium">Trka je počela</p>;
  }

  const slots = [
    { value: timeLeft.days,    label: "Dana" },
    { value: timeLeft.hours,   label: "Sati" },
    { value: timeLeft.minutes, label: "Min"  },
    { value: timeLeft.seconds, label: "Sek"  },
  ] as const;

  return (
    <div className="grid grid-cols-4 gap-3 mt-2">
      {slots.map(({ value, label }) => (
        <div key={label} className="text-center">
          <p
            className="text-2xl font-bold font-rajdhani text-cyan-brand"
            aria-label={`${value} ${label}`}
            suppressHydrationWarning
          >
            {String(value).padStart(2, "0")}
          </p>
          <p className="text-xs uppercase text-gray-500">{label}</p>
        </div>
      ))}
    </div>
  );
}

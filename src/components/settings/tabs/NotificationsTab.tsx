"use client";

import { Toggle } from "@/components/ui/Toggle";
import { cn } from "@/lib/utils";
import type {
  NotificationEventKey,
  NotificationPrefs,
} from "@/lib/settings/types";

interface NotificationsTabProps {
  value: NotificationPrefs;
  onChange: (next: NotificationPrefs) => void;
  isClubAdmin: boolean;
}

interface EventDef {
  key: NotificationEventKey;
  name: string;
  description: string;
  adminOnly?: boolean;
}

const EVENTS: EventDef[] = [
  {
    key: "raceEnd",
    name: "Kraj leta",
    description: "Obaveštenje kada se let uspešno završi.",
  },
  {
    key: "lowBattery",
    name: "Slaba baterija uređaja",
    description: "Upozorenje kada baterija uređaja padne ispod 20%.",
  },
  {
    key: "weakSignal",
    name: "Slab signal tokom leta",
    description: "Upozorenje kada signal sa uređaja postane nepouzdan.",
  },
  {
    key: "membershipRequest",
    name: "Zahtev za članstvo čeka odobrenje",
    description:
      "Obaveštenje kada neki golubar pošalje zahtev za pridruživanje vašem društvu.",
    adminOnly: true,
  },
];

export function NotificationsTab({
  value,
  onChange,
  isClubAdmin,
}: NotificationsTabProps) {
  const visibleEvents = EVENTS.filter((e) => !e.adminOnly || isClubAdmin);
  const channelsDisabled = !value.masterEnabled;

  function setMaster(checked: boolean) {
    onChange({ ...value, masterEnabled: checked });
  }

  function setChannel(
    key: NotificationEventKey,
    channel: "email" | "sound",
    checked: boolean
  ) {
    onChange({
      ...value,
      events: {
        ...value.events,
        [key]: { ...value.events[key], [channel]: checked },
      },
    });
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Master toggle */}
      <div className="card-redesign p-5 flex items-center justify-between gap-4 max-lg:p-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-text-primary">
            Sve notifikacije
          </h2>
          <p className="text-sm text-text-tertiary mt-0.5 max-lg:text-xs">
            Upravljajte koje notifikacije želite da primate i kako.
          </p>
        </div>
        <Toggle
          checked={value.masterEnabled}
          onChange={setMaster}
          label="Sve notifikacije"
        />
      </div>

      {/* Per-event cards */}
      {visibleEvents.map((event) => {
        const prefs = value.events[event.key];
        return (
          <div
            key={event.key}
            className="card-redesign p-5 flex items-center justify-between gap-6"
          >
            <div className="min-w-0">
              <h3 className="text-base font-medium text-text-primary">{event.name}</h3>
              <p className="text-sm text-text-tertiary mt-0.5">
                {event.description}
              </p>
            </div>
            <div className="flex items-start gap-5 flex-shrink-0">
              <ChannelToggle
                label="Email"
                checked={prefs.email}
                disabled={channelsDisabled}
                onChange={(c) => setChannel(event.key, "email", c)}
              />
              <ChannelToggle
                label="Zvuk"
                checked={prefs.sound}
                disabled={channelsDisabled}
                onChange={(c) => setChannel(event.key, "sound", c)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ChannelToggle({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span
        className={cn(
          "text-xs uppercase tracking-wide",
          disabled ? "text-text-disabled" : "text-text-tertiary"
        )}
      >
        {label}
      </span>
      <Toggle
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        label={label}
      />
    </div>
  );
}

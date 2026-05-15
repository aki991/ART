// Domain types for the Postavke (Settings) page.

export interface ProfileData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  avatar: string | null; // base64 data URL (saved as profiles.avatar_url)
}

export interface LoftData {
  address: string;
  city: string;
}

export interface NotificationEventPrefs {
  email: boolean;
  sound: boolean;
}

export type NotificationEventKey =
  | "raceEnd"
  | "lowBattery"
  | "weakSignal"
  | "membershipRequest";

export interface NotificationPrefs {
  masterEnabled: boolean;
  events: Record<NotificationEventKey, NotificationEventPrefs>;
}

export type ThemePref = "dark" | "light";
export type LanguagePref = "sr-Latn" | "sr-Cyrl";

export interface AppearancePrefs {
  theme: ThemePref;
  language: LanguagePref;
}

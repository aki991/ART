// Domain types for the Postavke (Settings) page.
// The app is frontend-only — these shapes are persisted to localStorage via the settings store.

export type UserRole = "golubar" | "club_admin" | "super_admin";

export interface ProfileData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  avatar: string | null; // base64 data URL
}

export interface LoftData {
  address: string;
  city: string;
}

// A) none — not in a club. B) pending — join request awaiting approval.
// C) member — regular member. D) admin — club administrator.
export type ClubMembershipStatus = "none" | "pending" | "member" | "admin";

export interface ClubMembership {
  status: ClubMembershipStatus;
  clubId: string | null;
  joinedAt: string | null; // ISO date
  requestedAt: string | null; // ISO date — set while status is "pending"
}

export interface Club {
  id: string;
  name: string;
  city: string;
  description: string;
  logo: string | null; // base64 data URL
  adminUserId: string;
  createdAt: string; // ISO date
}

// Editable subset of a club — admin edits these through the global save draft.
export interface ClubEditableData {
  name: string;
  city: string;
  description: string;
  logo: string | null;
}

export type ClubMemberRole = "member" | "admin";

export interface ClubMember {
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar: string | null;
  joinedAt: string; // ISO date
  role: ClubMemberRole;
}

export interface JoinRequest {
  id: string;
  clubId: string;
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar: string | null;
  requestedAt: string; // ISO date
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

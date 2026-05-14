import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import {
  MOCK_CLUBS,
  MOCK_CLUB_MEMBERS,
  CURRENT_USER_ID,
  seedCreatedClubJoinRequests,
  seedCreatedClubMembers,
} from "@/lib/data/mock-clubs";
import type {
  ProfileData,
  LoftData,
  ClubMembership,
  Club,
  ClubMember,
  ClubMemberRole,
  JoinRequest,
  ClubEditableData,
  NotificationPrefs,
  AppearancePrefs,
} from "@/lib/settings/types";

const DEFAULT_PROFILE: ProfileData = {
  firstName: "Andreja",
  lastName: "Milenković",
  username: "andreja",
  email: "andreja@aeroringtech.com",
  phone: "",
  avatar: null,
};

const DEFAULT_LOFT: LoftData = { address: "", city: "" };

const DEFAULT_NOTIFICATIONS: NotificationPrefs = {
  masterEnabled: true,
  events: {
    raceEnd: { email: true, sound: true },
    lowBattery: { email: false, sound: true },
    weakSignal: { email: false, sound: true },
    membershipRequest: { email: true, sound: true },
  },
};

const DEFAULT_APPEARANCE: AppearancePrefs = {
  theme: "dark",
  language: "sr-Latn",
};

const DEFAULT_MEMBERSHIP: ClubMembership = {
  status: "none",
  clubId: null,
  joinedAt: null,
  requestedAt: null,
};

interface SettingsState {
  profile: ProfileData;
  loft: LoftData;
  notifications: NotificationPrefs;
  appearance: AppearancePrefs;
  membership: ClubMembership;
  clubs: Club[];
  members: Record<string, ClubMember[]>;
  joinRequests: Record<string, JoinRequest[]>;

  // Form saves — committed through the global "Sačuvaj promene" button.
  saveProfile: (profile: ProfileData) => void;
  saveLoft: (loft: LoftData) => void;
  saveNotifications: (notifications: NotificationPrefs) => void;
  saveAppearance: (appearance: AppearancePrefs) => void;
  updateClub: (clubId: string, data: ClubEditableData) => void;

  // Immediate club actions — each has its own button / confirm dialog.
  sendJoinRequest: (clubId: string) => void;
  cancelJoinRequest: () => void;
  leaveClub: () => void;
  createClub: (data: { name: string; city: string; logo: string | null }) => void;
  deleteClub: (clubId: string) => void;
  approveJoinRequest: (clubId: string, requestId: string) => void;
  rejectJoinRequest: (clubId: string, requestId: string) => void;
  removeMember: (clubId: string, userId: string) => void;
  transferAdmin: (clubId: string, userId: string) => void;

  deleteAccount: () => void;
}

type PersistedSettings = Pick<
  SettingsState,
  | "profile"
  | "loft"
  | "notifications"
  | "appearance"
  | "membership"
  | "clubs"
  | "members"
  | "joinRequests"
>;

function currentUserAsMember(
  profile: ProfileData,
  role: ClubMemberRole,
  joinedAt: string
): ClubMember {
  return {
    userId: CURRENT_USER_ID,
    firstName: profile.firstName,
    lastName: profile.lastName,
    username: profile.username,
    avatar: profile.avatar,
    joinedAt,
    role,
  };
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,
      loft: DEFAULT_LOFT,
      notifications: DEFAULT_NOTIFICATIONS,
      appearance: DEFAULT_APPEARANCE,
      membership: DEFAULT_MEMBERSHIP,
      clubs: MOCK_CLUBS,
      members: {},
      joinRequests: {},

      saveProfile: (profile) => set({ profile }),
      saveLoft: (loft) => set({ loft }),
      saveNotifications: (notifications) => set({ notifications }),
      saveAppearance: (appearance) => set({ appearance }),

      updateClub: (clubId, data) =>
        set((state) => ({
          clubs: state.clubs.map((c) =>
            c.id === clubId ? { ...c, ...data } : c
          ),
        })),

      sendJoinRequest: (clubId) => {
        set({
          membership: {
            status: "pending",
            clubId,
            joinedAt: null,
            requestedAt: new Date().toISOString(),
          },
        });
        // Frontend-only prototype: there is no real club admin to approve the
        // request, so simulate approval after a short delay — otherwise the
        // "member" state would be unreachable.
        setTimeout(() => {
          const m = get().membership;
          if (m.status !== "pending" || m.clubId !== clubId) return;
          const joinedAt = new Date().toISOString();
          set((state) => {
            const existing =
              state.members[clubId] ?? MOCK_CLUB_MEMBERS[clubId] ?? [];
            return {
              membership: { status: "member", clubId, joinedAt, requestedAt: null },
              members: {
                ...state.members,
                [clubId]: [
                  ...existing.filter((mm) => mm.userId !== CURRENT_USER_ID),
                  currentUserAsMember(state.profile, "member", joinedAt),
                ],
              },
            };
          });
          const club = get().clubs.find((c) => c.id === clubId);
          toast.success("Zahtev za članstvo je odobren", {
            description: club ? `Sada ste član kluba ${club.name}.` : undefined,
          });
        }, 3000);
      },

      cancelJoinRequest: () => set({ membership: DEFAULT_MEMBERSHIP }),

      leaveClub: () => {
        const clubId = get().membership.clubId;
        set((state) => {
          if (!clubId) return { membership: DEFAULT_MEMBERSHIP };
          const roster = state.members[clubId];
          return {
            membership: DEFAULT_MEMBERSHIP,
            members: roster
              ? {
                  ...state.members,
                  [clubId]: roster.filter((m) => m.userId !== CURRENT_USER_ID),
                }
              : state.members,
          };
        });
      },

      createClub: ({ name, city, logo }) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const club: Club = {
          id,
          name: name.trim(),
          city: city.trim(),
          description: "",
          logo,
          adminUserId: CURRENT_USER_ID,
          createdAt: now,
        };
        set((state) => ({
          clubs: [club, ...state.clubs],
          membership: {
            status: "admin",
            clubId: id,
            joinedAt: now,
            requestedAt: null,
          },
          members: {
            ...state.members,
            [id]: [
              currentUserAsMember(state.profile, "admin", now),
              ...seedCreatedClubMembers(),
            ],
          },
          joinRequests: {
            ...state.joinRequests,
            [id]: seedCreatedClubJoinRequests(id),
          },
        }));
      },

      deleteClub: (clubId) =>
        set((state) => {
          const members = { ...state.members };
          const joinRequests = { ...state.joinRequests };
          delete members[clubId];
          delete joinRequests[clubId];
          return {
            clubs: state.clubs.filter((c) => c.id !== clubId),
            members,
            joinRequests,
            membership:
              state.membership.clubId === clubId
                ? DEFAULT_MEMBERSHIP
                : state.membership,
          };
        }),

      approveJoinRequest: (clubId, requestId) =>
        set((state) => {
          const requests = state.joinRequests[clubId] ?? [];
          const req = requests.find((r) => r.id === requestId);
          if (!req) return {};
          const newMember: ClubMember = {
            userId: req.userId,
            firstName: req.firstName,
            lastName: req.lastName,
            username: req.username,
            avatar: req.avatar,
            joinedAt: new Date().toISOString(),
            role: "member",
          };
          return {
            joinRequests: {
              ...state.joinRequests,
              [clubId]: requests.filter((r) => r.id !== requestId),
            },
            members: {
              ...state.members,
              [clubId]: [...(state.members[clubId] ?? []), newMember],
            },
          };
        }),

      rejectJoinRequest: (clubId, requestId) =>
        set((state) => ({
          joinRequests: {
            ...state.joinRequests,
            [clubId]: (state.joinRequests[clubId] ?? []).filter(
              (r) => r.id !== requestId
            ),
          },
        })),

      removeMember: (clubId, userId) =>
        set((state) => ({
          members: {
            ...state.members,
            [clubId]: (state.members[clubId] ?? []).filter(
              (m) => m.userId !== userId
            ),
          },
        })),

      transferAdmin: (clubId, userId) =>
        set((state) => ({
          clubs: state.clubs.map((c) =>
            c.id === clubId ? { ...c, adminUserId: userId } : c
          ),
          members: {
            ...state.members,
            [clubId]: (state.members[clubId] ?? []).map((m): ClubMember => {
              if (m.userId === userId) return { ...m, role: "admin" };
              if (m.userId === CURRENT_USER_ID) return { ...m, role: "member" };
              return m;
            }),
          },
          membership:
            state.membership.clubId === clubId
              ? { ...state.membership, status: "member" }
              : state.membership,
        })),

      deleteAccount: () =>
        set({
          profile: DEFAULT_PROFILE,
          loft: DEFAULT_LOFT,
          notifications: DEFAULT_NOTIFICATIONS,
          appearance: DEFAULT_APPEARANCE,
          membership: DEFAULT_MEMBERSHIP,
          clubs: MOCK_CLUBS,
          members: {},
          joinRequests: {},
        }),
    }),
    {
      name: "art-settings",
      version: 2,
      // v2 reshaped notifications ({ masterEnabled, events }) and appearance
      // (language casing). Those slices had no UI in v1, so reset them to the
      // new defaults; everything else carries over untouched.
      migrate: (persisted, version) => {
        const state = persisted as PersistedSettings;
        if (version < 2) {
          return {
            ...state,
            notifications: DEFAULT_NOTIFICATIONS,
            appearance: DEFAULT_APPEARANCE,
          };
        }
        return state;
      },
      partialize: (state) => ({
        profile: state.profile,
        loft: state.loft,
        notifications: state.notifications,
        appearance: state.appearance,
        membership: state.membership,
        clubs: state.clubs,
        members: state.members,
        joinRequests: state.joinRequests,
      }),
    }
  )
);

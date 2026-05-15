import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  LoftData,
  NotificationPrefs,
  AppearancePrefs,
} from "@/lib/settings/types";

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

interface SettingsState {
  loft: LoftData;
  notifications: NotificationPrefs;
  appearance: AppearancePrefs;

  saveLoft: (loft: LoftData) => void;
  saveNotifications: (notifications: NotificationPrefs) => void;
  saveAppearance: (appearance: AppearancePrefs) => void;
}

type PersistedSettings = Pick<
  SettingsState,
  "loft" | "notifications" | "appearance"
>;

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      loft: DEFAULT_LOFT,
      notifications: DEFAULT_NOTIFICATIONS,
      appearance: DEFAULT_APPEARANCE,

      saveLoft: (loft) => set({ loft }),
      saveNotifications: (notifications) => set({ notifications }),
      saveAppearance: (appearance) => set({ appearance }),
    }),
    {
      name: "art-settings",
      version: 4,
      // v4 dropped club/membership state (now in Supabase). v3 dropped the mock
      // profile slice (also Supabase). v2 reshaped notifications and appearance.
      migrate: (persisted, version) => {
        const state = persisted as Record<string, unknown>;
        if (version < 2) {
          return {
            loft: (state.loft as LoftData) ?? DEFAULT_LOFT,
            notifications: DEFAULT_NOTIFICATIONS,
            appearance: DEFAULT_APPEARANCE,
          } satisfies PersistedSettings;
        }
        return {
          loft: (state.loft as LoftData) ?? DEFAULT_LOFT,
          notifications:
            (state.notifications as NotificationPrefs) ?? DEFAULT_NOTIFICATIONS,
          appearance: (state.appearance as AppearancePrefs) ?? DEFAULT_APPEARANCE,
        } satisfies PersistedSettings;
      },
      partialize: (state) => ({
        loft: state.loft,
        notifications: state.notifications,
        appearance: state.appearance,
      }),
    }
  )
);

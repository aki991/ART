"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSettingsStore } from "@/lib/store/settings-store";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { updateProfileAction } from "@/app/auth/profile-actions";
import type {
  AppearancePrefs,
  Club,
  ClubEditableData,
  LoftData,
  NotificationPrefs,
  ProfileData,
} from "@/lib/settings/types";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { SettingsTabs } from "./SettingsTabs";
import type { SettingsTab } from "./SettingsTabs";
import { SettingsFooter } from "./SettingsFooter";
import { ProfileTab } from "./tabs/ProfileTab";
import { ClubTab } from "./tabs/ClubTab";
import { LoftTab } from "./tabs/LoftTab";
import { NotificationsTab } from "./tabs/NotificationsTab";
import { AppearanceTab } from "./tabs/AppearanceTab";
import { AboutTab } from "./tabs/AboutTab";

const TABS: SettingsTab[] = [
  { id: "profil", label: "Profil" },
  { id: "klub", label: "Klub" },
  { id: "golubarnik", label: "Golubarnik" },
  { id: "notifikacije", label: "Notifikacije" },
  { id: "izgled", label: "Izgled" },
  { id: "o-aplikaciji", label: "O aplikaciji" },
];
const TAB_IDS = TABS.map((t) => t.id);

function clubEditableOf(club: Club): ClubEditableData {
  return {
    name: club.name,
    city: club.city,
    description: club.description,
    logo: club.logo,
  };
}

function profileEqual(a: ProfileData, b: ProfileData): boolean {
  return (
    a.firstName === b.firstName &&
    a.lastName === b.lastName &&
    a.username === b.username &&
    a.email === b.email &&
    a.phone === b.phone &&
    a.avatar === b.avatar
  );
}

function loftEqual(a: LoftData, b: LoftData): boolean {
  return a.address === b.address && a.city === b.city;
}

function clubDraftEqual(a: ClubEditableData, b: ClubEditableData): boolean {
  return (
    a.name === b.name &&
    a.city === b.city &&
    a.description === b.description &&
    a.logo === b.logo
  );
}

function notificationsEqual(
  a: NotificationPrefs,
  b: NotificationPrefs
): boolean {
  if (a.masterEnabled !== b.masterEnabled) return false;
  const keys: (keyof NotificationPrefs["events"])[] = [
    "raceEnd",
    "lowBattery",
    "weakSignal",
    "membershipRequest",
  ];
  return keys.every(
    (k) =>
      a.events[k].email === b.events[k].email &&
      a.events[k].sound === b.events[k].sound
  );
}

function appearanceEqual(a: AppearancePrefs, b: AppearancePrefs): boolean {
  return a.theme === b.theme && a.language === b.language;
}

export function SettingsClient() {
  const router = useRouter();
  const currentUser = useCurrentUser();

  const supabaseProfile: ProfileData = useMemo(
    () => ({
      firstName: currentUser.profile?.firstName ?? "",
      lastName: currentUser.profile?.lastName ?? "",
      username: currentUser.profile?.username ?? "",
      email: currentUser.email,
      phone: currentUser.profile?.phone ?? "",
      avatar: currentUser.profile?.avatarUrl ?? null,
    }),
    [currentUser]
  );

  const loft = useSettingsStore((s) => s.loft);
  const membership = useSettingsStore((s) => s.membership);
  const clubs = useSettingsStore((s) => s.clubs);
  const notifications = useSettingsStore((s) => s.notifications);
  const appearance = useSettingsStore((s) => s.appearance);
  const saveLoft = useSettingsStore((s) => s.saveLoft);
  const saveNotifications = useSettingsStore((s) => s.saveNotifications);
  const saveAppearance = useSettingsStore((s) => s.saveAppearance);
  const updateClub = useSettingsStore((s) => s.updateClub);

  const isAdmin = membership.status === "admin";
  const myClub = membership.clubId
    ? clubs.find((c) => c.id === membership.clubId) ?? null
    : null;

  const [activeTab, setActiveTab] = useState("profil");
  const [draftProfile, setDraftProfile] = useState<ProfileData>(supabaseProfile);
  const [draftLoft, setDraftLoft] = useState(loft);
  const [draftClub, setDraftClub] = useState<ClubEditableData | null>(
    isAdmin && myClub ? clubEditableOf(myClub) : null
  );
  const [draftNotifications, setDraftNotifications] = useState(notifications);
  const [draftAppearance, setDraftAppearance] = useState(appearance);
  const [saving, setSaving] = useState(false);
  const [navGuardOpen, setNavGuardOpen] = useState(false);
  const pendingHrefRef = useRef<string | null>(null);

  // Deep-linking: pick up the active tab from the URL hash on mount.
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (TAB_IDS.includes(hash)) setActiveTab(hash);
  }, []);

  useEffect(() => setDraftProfile(supabaseProfile), [supabaseProfile]);
  useEffect(() => setDraftLoft(loft), [loft]);
  useEffect(() => setDraftNotifications(notifications), [notifications]);
  useEffect(() => setDraftAppearance(appearance), [appearance]);
  useEffect(() => {
    setDraftClub(isAdmin && myClub ? clubEditableOf(myClub) : null);
  }, [isAdmin, myClub]);

  const dirty =
    !profileEqual(draftProfile, supabaseProfile) ||
    !loftEqual(draftLoft, loft) ||
    !notificationsEqual(draftNotifications, notifications) ||
    !appearanceEqual(draftAppearance, appearance) ||
    (draftClub !== null &&
      myClub !== null &&
      !clubDraftEqual(draftClub, clubEditableOf(myClub)));

  // Guard against navigating away (sidebar links, refresh) with unsaved changes.
  useEffect(() => {
    if (!dirty) return;

    function onClickCapture(e: MouseEvent) {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      const anchor = (e.target as HTMLElement).closest("a");
      const href = anchor?.getAttribute("href");
      if (!href || !href.startsWith("/")) return;
      if (href === "/settings" || href.startsWith("/settings#")) return;
      e.preventDefault();
      e.stopPropagation();
      pendingHrefRef.current = href;
      setNavGuardOpen(true);
    }

    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }

    document.addEventListener("click", onClickCapture, true);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      document.removeEventListener("click", onClickCapture, true);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [dirty]);

  function changeTab(id: string) {
    setActiveTab(id);
    window.history.replaceState(null, "", `#${id}`);
  }

  async function handleSave() {
    setSaving(true);

    if (!profileEqual(draftProfile, supabaseProfile)) {
      const result = await updateProfileAction({
        username: draftProfile.username,
        firstName: draftProfile.firstName,
        lastName: draftProfile.lastName,
        phone: draftProfile.phone,
        avatarUrl: draftProfile.avatar,
      });
      if (!result.ok) {
        setSaving(false);
        toast.error(
          result.code === "username_taken"
            ? "Korisničko ime je već zauzeto."
            : "Snimanje profila nije uspelo."
        );
        return;
      }
    }

    saveLoft(draftLoft);
    saveNotifications(draftNotifications);
    saveAppearance(draftAppearance);
    if (draftClub && myClub) updateClub(myClub.id, draftClub);
    setSaving(false);
    toast.success("Postavke sačuvane ✓");
    router.refresh();
  }

  function handleDiscard() {
    setDraftProfile(supabaseProfile);
    setDraftLoft(loft);
    setDraftNotifications(notifications);
    setDraftAppearance(appearance);
    setDraftClub(isAdmin && myClub ? clubEditableOf(myClub) : null);
  }

  function confirmLeave() {
    setNavGuardOpen(false);
    const href = pendingHrefRef.current;
    pendingHrefRef.current = null;
    if (href) router.push(href);
  }

  function cancelLeave() {
    setNavGuardOpen(false);
    pendingHrefRef.current = null;
  }

  return (
    <div>
      <SettingsTabs tabs={TABS} activeTab={activeTab} onChange={changeTab} />

      <div
        role="tabpanel"
        id={`settings-panel-${activeTab}`}
        aria-labelledby={`settings-tab-${activeTab}`}
        className="pb-4"
      >
        {activeTab === "profil" && (
          <ProfileTab value={draftProfile} onChange={setDraftProfile} />
        )}
        {activeTab === "klub" && (
          <ClubTab clubDraft={draftClub} onClubDraftChange={setDraftClub} />
        )}
        {activeTab === "golubarnik" && (
          <LoftTab value={draftLoft} onChange={setDraftLoft} />
        )}
        {activeTab === "notifikacije" && (
          <NotificationsTab
            value={draftNotifications}
            onChange={setDraftNotifications}
          />
        )}
        {activeTab === "izgled" && (
          <AppearanceTab value={draftAppearance} onChange={setDraftAppearance} />
        )}
        {activeTab === "o-aplikaciji" && <AboutTab />}
      </div>

      <SettingsFooter
        dirty={dirty}
        saving={saving}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />

      <ConfirmModal
        isOpen={navGuardOpen}
        onClose={cancelLeave}
        onConfirm={confirmLeave}
        title="Neuračunate izmene"
        message="Imate neuračunate izmene. Da li želite da odbacite promene?"
        confirmLabel="Odbaci promene"
        cancelLabel="Ostani na stranici"
        variant="danger"
      />
    </div>
  );
}

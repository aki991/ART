"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSettingsStore } from "@/lib/store/settings-store";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { updateProfileAction } from "@/app/auth/profile-actions";
import type {
  AppearancePrefs,
  LoftData,
  NotificationPrefs,
  ProfileData,
} from "@/lib/settings/types";
import type {
  ClubCreationRequestRow,
  ClubMemberRow,
  ClubRow,
  JoinRequestRow,
  MembershipSnapshot,
} from "@/app/actions/club-types";
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
  { id: "klub", label: "Društvo" },
  { id: "golubarnik", label: "Golubarnik" },
  { id: "notifikacije", label: "Notifikacije" },
  { id: "izgled", label: "Izgled" },
  { id: "o-aplikaciji", label: "O aplikaciji" },
];
const TAB_IDS = TABS.map((t) => t.id);

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

interface SettingsClientProps {
  membership: MembershipSnapshot | null;
  pendingJoinRequest:
    | (JoinRequestRow & { club: ClubRow })
    | null;
  creationRequest: ClubCreationRequestRow | null;
  initialClubs: ClubRow[];
  members: ClubMemberRow[];
  joinRequests: JoinRequestRow[];
}

export function SettingsClient({
  membership,
  pendingJoinRequest,
  creationRequest,
  initialClubs,
  members,
  joinRequests,
}: SettingsClientProps) {
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
  const notifications = useSettingsStore((s) => s.notifications);
  const appearance = useSettingsStore((s) => s.appearance);
  const saveLoft = useSettingsStore((s) => s.saveLoft);
  const saveNotifications = useSettingsStore((s) => s.saveNotifications);
  const saveAppearance = useSettingsStore((s) => s.saveAppearance);

  const [activeTab, setActiveTab] = useState("profil");
  const [draftProfile, setDraftProfile] = useState<ProfileData>(supabaseProfile);
  const [draftLoft, setDraftLoft] = useState(loft);
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

  const dirty =
    !profileEqual(draftProfile, supabaseProfile) ||
    !loftEqual(draftLoft, loft) ||
    !notificationsEqual(draftNotifications, notifications) ||
    !appearanceEqual(draftAppearance, appearance);

  // Guard against navigating away with unsaved changes.
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
    setSaving(false);
    toast.success("Postavke sačuvane ✓");
    router.refresh();
  }

  function handleDiscard() {
    setDraftProfile(supabaseProfile);
    setDraftLoft(loft);
    setDraftNotifications(notifications);
    setDraftAppearance(appearance);
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

  const isClubAdmin = membership?.role === "admin";

  return (
    <div>
      <SettingsTabs tabs={TABS} activeTab={activeTab} onChange={changeTab} />

      <div
        role="tabpanel"
        id={`settings-panel-${activeTab}`}
        aria-labelledby={`settings-tab-${activeTab}`}
        className="pb-4 max-lg:pb-[120px]"
      >
        {activeTab === "profil" && (
          <ProfileTab value={draftProfile} onChange={setDraftProfile} />
        )}
        {activeTab === "klub" && (
          <ClubTab
            membership={membership}
            pendingJoinRequest={pendingJoinRequest}
            creationRequest={creationRequest}
            initialClubs={initialClubs}
            members={members}
            joinRequests={joinRequests}
          />
        )}
        {activeTab === "golubarnik" && (
          <LoftTab value={draftLoft} onChange={setDraftLoft} />
        )}
        {activeTab === "notifikacije" && (
          <NotificationsTab
            value={draftNotifications}
            onChange={setDraftNotifications}
            isClubAdmin={isClubAdmin}
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

"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useConnectionStore } from "@/lib/store/connection-store";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { performSignOut } from "@/lib/auth/sign-out";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface SidebarFooterProps {
  expanded: boolean;
}

const STATUS_LABELS = {
  connected: "Povezano",
  connecting: "Povezivanje",
  disconnected: "Nije povezano",
  error: "Greška",
} as const;

function initialsFor(firstName: string, lastName: string, fallback: string): string {
  const f = (firstName || "").trim();
  const l = (lastName || "").trim();
  if (f || l) return `${f.charAt(0)}${l.charAt(0)}`.toUpperCase() || "?";
  return fallback.charAt(0).toUpperCase() || "?";
}

export function SidebarFooter({ expanded }: SidebarFooterProps) {
  const router = useRouter();
  const status = useConnectionStore((s) => s.status);
  const user = useCurrentUser();
  const [pending, startTransition] = useTransition();
  const [signingOut, setSigningOut] = useState(false);

  const profile = user.profile;
  const displayName = profile?.firstName || profile?.username || user.email;
  const subtitle = profile?.username ? `@${profile.username}` : user.email;
  const initials = initialsFor(
    profile?.firstName ?? "",
    profile?.lastName ?? "",
    profile?.username ?? user.email
  );

  function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    startTransition(async () => {
      await performSignOut();
      router.replace("/");
      router.refresh();
    });
  }

  const dotClass = cn(
    "rounded-full border-2 flex-shrink-0",
    status === "connected" && "bg-status-success border-status-success/60",
    status === "connecting" && "bg-status-warning border-status-warning/60 animate-pulse",
    status === "disconnected" && "bg-text-disabled border-text-disabled/60",
    status === "error" && "bg-status-error border-status-error/60"
  );

  return (
    <div className="border-t border-border px-3 xl:px-3.5 2xl:px-4 h-[72px] flex items-center justify-between gap-2 xl:gap-2.5 2xl:gap-3 flex-shrink-0">
      <Link
        href="/profile"
        aria-label="Otvori moj profil"
        className="flex items-center gap-3 min-w-0 rounded-md p-1 -m-1 hover:bg-bg-hover transition-colors"
      >
        <div className="relative flex-shrink-0">
          {profile?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt=""
              className="w-9 h-9 rounded-full object-cover border border-accent/40"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-accent-light border border-accent/40 flex items-center justify-center text-accent text-base font-semibold font-rajdhani">
              {initials}
            </div>
          )}
          {!expanded && (
            <span
              className={cn("absolute bottom-0 right-0 w-4 h-4 border-bg-surface", dotClass)}
              aria-hidden="true"
              title={`Status: ${STATUS_LABELS[status]}`}
            />
          )}
        </div>

        {expanded && (
          <div className="min-w-0">
            <p className="text-text-primary text-base font-medium truncate font-rajdhani">
              {displayName}
            </p>
            <p className="text-text-tertiary text-xs truncate">{subtitle}</p>
          </div>
        )}
      </Link>

      {expanded && (
        <div className="flex items-center gap-1 flex-shrink-0">
          <div
            className="flex items-center gap-2.5"
            aria-label={`Status: ${STATUS_LABELS[status]}`}
            title={`Status: ${STATUS_LABELS[status]}`}
          >
            <span className={cn("w-3 h-3", dotClass)} aria-hidden="true" />
          </div>
          <ThemeToggle className="p-1.5" />
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut || pending}
            aria-label="Odjavi se"
            title="Odjavi se"
            className="p-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50"
          >
            <LogOut size={16} strokeWidth={1.6} />
          </button>
        </div>
      )}
    </div>
  );
}

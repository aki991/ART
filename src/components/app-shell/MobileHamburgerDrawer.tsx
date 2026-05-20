"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  Settings,
  ShieldCheck,
  LogOut,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { performSignOut } from "@/lib/auth/sign-out";

interface MobileHamburgerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

function initialsFor(firstName: string, lastName: string, fallback: string) {
  const f = (firstName || "").trim();
  const l = (lastName || "").trim();
  if (f || l) return `${f.charAt(0)}${l.charAt(0)}`.toUpperCase() || "?";
  return fallback.charAt(0).toUpperCase() || "?";
}

export function MobileHamburgerDrawer({
  isOpen,
  onClose,
}: MobileHamburgerDrawerProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const user = useCurrentUser();
  const [pending, startTransition] = useTransition();
  const [signingOut, setSigningOut] = useState(false);
  const [themeMounted, setThemeMounted] = useState(false);

  useEffect(() => {
    setThemeMounted(true);
  }, []);

  const profile = user.profile;
  const displayName = profile?.firstName || profile?.username || user.email;
  const subtitle = profile?.username ? `@${profile.username}` : user.email;
  const initials = initialsFor(
    profile?.firstName ?? "",
    profile?.lastName ?? "",
    profile?.username ?? user.email
  );

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    startTransition(async () => {
      await performSignOut();
      onClose();
      router.replace("/");
      router.refresh();
    });
  }

  const itemClass =
    "flex items-center gap-3 px-4 py-3 text-text-primary hover:bg-bg-hover transition-colors text-base";

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Glavni meni"
        className={cn(
          "fixed top-0 left-0 bottom-0 z-50 w-72 max-w-[85vw] bg-bg-surface shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-[72px] px-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <Image
              src="/art-logo.png"
              alt="Aero Ring Tech"
              width={40}
              height={40}
              className="flex-shrink-0"
              priority
            />
            <div className="flex flex-col justify-center gap-0.5 min-w-0">
              <span className="text-sm font-bold tracking-wide whitespace-nowrap font-rajdhani leading-none text-gradient-logo">
                AERO RING TECH
              </span>
              <span className="text-[9px] font-medium tracking-[0.07em] text-text-tertiary whitespace-nowrap leading-none">
                THE ART OF FLIGHT
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zatvori meni"
            className="p-2 -mr-2 text-text-tertiary hover:text-text-primary hover:bg-bg-hover rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <Link
          href="/profile"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 border-b border-border flex-shrink-0 hover:bg-bg-hover transition-colors"
        >
          {profile?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt=""
              className="w-10 h-10 rounded-full object-cover border border-accent/40 flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-accent-light border border-accent/40 flex items-center justify-center text-accent text-base font-semibold font-rajdhani flex-shrink-0">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-text-primary text-sm font-medium truncate font-rajdhani">
              {displayName}
            </p>
            <p className="text-text-tertiary text-xs truncate">{subtitle}</p>
          </div>
        </Link>

        <nav className="flex-1 overflow-y-auto py-2" aria-label="Drawer navigacija">
          <Link href="/dashboard" onClick={onClose} className={itemClass}>
            <Home className="w-5 h-5" aria-hidden="true" />
            <span>Početna</span>
          </Link>

          {user.isSuperAdmin && (
            <Link
              href="/super-admin/club-requests"
              onClick={onClose}
              className={itemClass}
            >
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              <span>Super Admin</span>
            </Link>
          )}

          <Link href="/settings" onClick={onClose} className={itemClass}>
            <Settings className="w-5 h-5" aria-hidden="true" />
            <span>Postavke</span>
          </Link>

          <div role="separator" className="my-2 mx-4 h-px bg-border" />

          {themeMounted ? (
            <button
              type="button"
              onClick={toggleTheme}
              className={cn(itemClass, "w-full text-left")}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Moon className="w-5 h-5" aria-hidden="true" />
              )}
              <span>{theme === "dark" ? "Svetla tema" : "Tamna tema"}</span>
            </button>
          ) : (
            <div
              className={cn(itemClass, "w-full")}
              aria-hidden="true"
              style={{ visibility: "hidden" }}
            >
              <Moon className="w-5 h-5" />
              <span>Tamna tema</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut || pending}
            className={cn(itemClass, "w-full text-left disabled:opacity-50")}
          >
            <LogOut className="w-5 h-5" aria-hidden="true" />
            <span>Odjavi se</span>
          </button>
        </nav>
      </aside>
    </>
  );
}

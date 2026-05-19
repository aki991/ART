"use client";

import Link from "next/link";
import { Play, ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Breadcrumb } from "./Breadcrumb";
import type { BreadcrumbSegment } from "./Breadcrumb";
import { useConnectionStore } from "@/lib/store/connection-store";

interface TopBarProps {
  breadcrumbSegments?: BreadcrumbSegment[];
}

function LiveIndicator() {
  return (
    <span className="flex items-center gap-1.5 ml-3">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-error opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-status-error" />
      </span>
      <span className="text-xs font-semibold uppercase tracking-widest text-status-error">Live</span>
    </span>
  );
}

export function TopBar({ breadcrumbSegments }: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isDashboard = pathname === "/dashboard";
  const isScanning = pathname === "/scanning";
  const isRaceDetail = /^\/races\/.+/.test(pathname);

  const status = useConnectionStore((s) => s.status);
  const raceActive = useConnectionStore((s) => s.raceActive);
  const raceName = useConnectionStore((s) => s.raceName);

  const scanningTitle = raceActive
    ? `Let u toku — ${raceName}`
    : status === "connected"
    ? "Spreman za let"
    : "Povezivanje uređaja";

  return (
    <header className="h-[72px] bg-bg-app hidden lg:flex items-center justify-between px-4 xl:px-5 2xl:px-6 flex-shrink-0 gap-3 min-w-0">
      {isDashboard ? (
        <h1 className="text-2xl xl:text-2xl 2xl:text-3xl font-semibold font-rajdhani text-gradient-page-title truncate min-w-0">
          Dobrodošao u Aero Ring Tech
        </h1>
      ) : isScanning ? (
        <div className="flex items-center min-w-0">
          <h1 className="text-2xl xl:text-2xl 2xl:text-3xl font-semibold font-rajdhani text-gradient-page-title truncate">
            {scanningTitle}
          </h1>
          {raceActive && <LiveIndicator />}
        </div>
      ) : isRaceDetail ? (
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 1) router.back();
            else router.push("/races");
          }}
          className="flex items-center gap-3 xl:gap-3.5 2xl:gap-4 text-xl xl:text-xl 2xl:text-2xl text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-7 h-7 xl:w-7 xl:h-7 2xl:w-8 2xl:h-8" />
          Nazad
        </button>
      ) : (
        <Breadcrumb segments={breadcrumbSegments} />
      )}

      {isDashboard && (
        <Link
          href="/scanning"
          className="btn-shine-redesign inline-flex items-center gap-2 xl:gap-2 2xl:gap-2.5 px-4 xl:px-5 2xl:px-6 py-2.5 xl:py-3 2xl:py-3.5 rounded-lg font-bold text-base xl:text-base 2xl:text-lg bg-accent hover:bg-accent-hover text-text-on-accent transition-colors whitespace-nowrap flex-shrink-0"
        >
          <Play className="w-4 h-4 xl:w-4 xl:h-4 2xl:w-5 2xl:h-5" fill="currentColor" aria-hidden="true" />
          Pokreni novi let
        </Link>
      )}
    </header>
  );
}

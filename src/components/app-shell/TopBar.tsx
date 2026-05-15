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
    ? `Trka u toku — ${raceName}`
    : status === "connected"
    ? "Spreman za trku"
    : "Povezivanje uređaja";

  return (
    <header className="h-[72px] bg-bg-app flex items-center justify-between px-6 flex-shrink-0">
      {isDashboard ? (
        <h1 className="text-3xl font-semibold font-rajdhani text-gradient-page-title">
          Dobrodošao u Aero Ring Tech
        </h1>
      ) : isScanning ? (
        <div className="flex items-center">
          <h1 className="text-3xl font-semibold font-rajdhani text-gradient-page-title">
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
          className="flex items-center gap-4 text-2xl text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-8 h-8" />
          Nazad
        </button>
      ) : (
        <Breadcrumb segments={breadcrumbSegments} />
      )}

      {isDashboard && (
        <Link
          href="/scanning"
          className="btn-shine-redesign inline-flex items-center gap-2.5 px-6 py-3.5 rounded-lg font-bold text-lg bg-accent hover:bg-accent-hover text-text-on-accent transition-colors"
        >
          <Play className="w-5 h-5" fill="currentColor" aria-hidden="true" />
          Pokreni novu trku
        </Link>
      )}
    </header>
  );
}

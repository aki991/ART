"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { usePathname } from "next/navigation";
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
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
      </span>
      <span className="text-xs font-semibold uppercase tracking-widest text-red-400">Live</span>
    </span>
  );
}

export function TopBar({ breadcrumbSegments }: TopBarProps) {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";
  const isScanning = pathname === "/scanning";

  const status = useConnectionStore((s) => s.status);
  const raceActive = useConnectionStore((s) => s.raceActive);
  const raceName = useConnectionStore((s) => s.raceName);

  const scanningTitle = raceActive
    ? `Trka u toku — ${raceName}`
    : status === "connected"
    ? "Spreman za trku"
    : "Povezivanje uređaja";

  return (
    <header className="h-[72px] bg-app-surface flex items-center justify-between px-6 flex-shrink-0">
      {isDashboard ? (
        <h1 className="text-2xl font-semibold text-white font-rajdhani">
          Dobrodošao u Aero Ring Tech
        </h1>
      ) : isScanning ? (
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold text-white font-rajdhani">
            {scanningTitle}
          </h1>
          {raceActive && <LiveIndicator />}
        </div>
      ) : (
        <Breadcrumb segments={breadcrumbSegments} />
      )}

      {isDashboard && (
        <Link
          href="/scanning"
          className="btn-shine-redesign inline-flex items-center gap-2 px-5 py-2.5 rounded-md font-semibold text-sm bg-cyan-brand hover:bg-cyan-dark text-white transition-colors"
        >
          <Play className="w-4 h-4" aria-hidden="true" />
          Pokreni novu trku
        </Link>
      )}
    </header>
  );
}

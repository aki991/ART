"use client";

import Link from "next/link";
import { Play, ArrowLeft, Signal, Battery } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Breadcrumb } from "./Breadcrumb";
import type { BreadcrumbSegment } from "./Breadcrumb";
import { useConnectionStore } from "@/lib/store/connection-store";

interface TopBarProps {
  breadcrumbSegments?: BreadcrumbSegment[];
}

// Signal value is hardcoded for now — bazna stanica još ne izlaže RSSI.
const SIGNAL_STRENGTH_PCT = 85;

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

function DeviceHealthIndicators() {
  const status = useConnectionStore((s) => s.status);
  const deviceInfo = useConnectionStore((s) => s.deviceInfo);
  if (status !== "connected" || !deviceInfo) return null;

  const batteryColor =
    deviceInfo.batteryPct >= 50
      ? "text-status-success"
      : deviceInfo.batteryPct >= 20
        ? "text-status-warning"
        : "text-status-error";

  return (
    <div className="flex items-center gap-3 xl:gap-4 flex-shrink-0">
      <div className="flex items-center gap-1.5">
        <Signal className="w-4 h-4 text-accent flex-shrink-0" aria-hidden="true" />
        <span className="text-xs uppercase tracking-wide text-text-tertiary font-medium">Signal</span>
        <span className="text-xs xl:text-sm font-bold font-rajdhani text-text-primary tabular-nums">
          {SIGNAL_STRENGTH_PCT}%
        </span>
      </div>
      <div className="h-4 w-px bg-border-strong" aria-hidden="true" />
      <div className="flex items-center gap-1.5">
        <Battery className={`w-4 h-4 flex-shrink-0 ${batteryColor}`} aria-hidden="true" />
        <span className="text-xs uppercase tracking-wide text-text-tertiary font-medium">Baterija</span>
        <span className="text-xs xl:text-sm font-bold font-rajdhani text-text-primary tabular-nums">
          {deviceInfo.batteryPct}%
        </span>
      </div>
    </div>
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
    <header className="h-[72px] bg-bg-app flex items-center justify-between px-4 xl:px-6 flex-shrink-0 gap-3 min-w-0">
      {isDashboard ? (
        <h1 className="text-2xl xl:text-3xl font-semibold font-rajdhani text-gradient-page-title truncate min-w-0">
          Dobrodošao u Aero Ring Tech
        </h1>
      ) : isScanning ? (
        <div className="flex items-center min-w-0">
          <h1 className="text-2xl xl:text-3xl font-semibold font-rajdhani text-gradient-page-title truncate">
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
          className="flex items-center gap-3 xl:gap-4 text-xl xl:text-2xl text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-7 h-7 xl:w-8 xl:h-8" />
          Nazad
        </button>
      ) : (
        <Breadcrumb segments={breadcrumbSegments} />
      )}

      <div className="flex items-center gap-4 xl:gap-6 ml-auto flex-shrink-0">
        <DeviceHealthIndicators />
        {isDashboard && (
          <Link
            href="/scanning"
            className="btn-shine-redesign inline-flex items-center gap-2 xl:gap-2.5 px-4 xl:px-6 py-2.5 xl:py-3.5 rounded-lg font-bold text-base xl:text-lg bg-accent hover:bg-accent-hover text-text-on-accent transition-colors whitespace-nowrap flex-shrink-0"
          >
            <Play className="w-4 h-4 xl:w-5 xl:h-5" fill="currentColor" aria-hidden="true" />
            Pokreni novu trku
          </Link>
        )}
      </div>
    </header>
  );
}

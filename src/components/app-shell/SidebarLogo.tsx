"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarLogoProps {
  expanded: boolean;
  toggle: () => void;
}

export function SidebarLogo({ expanded, toggle }: SidebarLogoProps) {
  return (
    <div
      className={cn(
        "flex items-center h-[72px] flex-shrink-0 border-b border-white/5 transition-[padding] duration-200",
        expanded ? "px-4 justify-between" : "px-3 justify-center"
      )}
    >
      {expanded && (
        <div className="flex items-center gap-3 min-w-0">
          <Image
            src="/art-logo.png"
            alt="Aero Ring Tech"
            width={56}
            height={56}
            className="flex-shrink-0"
            priority
          />
          <span className="text-base font-bold tracking-wider text-white whitespace-nowrap font-rajdhani">
            AERO RING TECH
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={toggle}
        aria-label={expanded ? "Skupi sidebar" : "Proširi sidebar"}
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-md transition-colors flex-shrink-0",
          "text-white/60 hover:text-white hover:bg-white/10",
          "focus:outline-none focus:ring-2 focus:ring-cyan-brand/50"
        )}
      >
        {expanded ? (
          <ChevronLeft size={18} strokeWidth={2} aria-hidden="true" />
        ) : (
          <ChevronRight size={18} strokeWidth={2} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

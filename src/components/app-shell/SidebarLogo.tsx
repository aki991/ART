"use client";

import { cn } from "@/lib/utils";

interface SidebarLogoProps {
  expanded: boolean;
}

export function SidebarLogo({ expanded }: SidebarLogoProps) {
  return (
    <div
      className={cn(
        "flex items-center border-b border-white/10 flex-shrink-0 overflow-hidden transition-all duration-200",
        expanded ? "gap-4 px-4 py-5" : "justify-center px-0 py-4"
      )}
    >
      <img
        src="/art-logo.png"
        alt="ART"
        className={cn(
          "object-contain flex-shrink-0 transition-all duration-200",
          expanded ? "w-14 h-14" : "w-12 h-12"
        )}
      />
      <span
        className={cn(
          "font-orbitron text-sm font-semibold text-white tracking-widest whitespace-nowrap transition-all duration-200 overflow-hidden",
          expanded ? "opacity-100 max-w-[240px]" : "opacity-0 max-w-0"
        )}
      >
        AERO RING TECH
      </span>
    </div>
  );
}

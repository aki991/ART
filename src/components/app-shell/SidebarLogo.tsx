"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarLogoProps {
  expanded: boolean;
  toggle: () => void;
}

export function SidebarLogo({ expanded, toggle }: SidebarLogoProps) {
  if (!expanded) {
    return (
      <div className="flex items-center justify-center h-[72px] flex-shrink-0 border-b border-border">
        <button
          type="button"
          onClick={toggle}
          aria-label="Proširi sidebar"
          className="flex items-center justify-center w-9 h-9 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50"
        >
          <ChevronRight size={20} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between h-[72px] px-4 flex-shrink-0 border-b border-border">
      <div className="flex items-center gap-3 min-w-0">
        <Image
          src="/art-logo.png"
          alt="Aero Ring Tech"
          width={60}
          height={60}
          className="flex-shrink-0"
          priority
        />
        <div className="flex flex-col justify-center gap-0.5 min-w-0">
          <span className="text-lg font-bold tracking-widest whitespace-nowrap font-rajdhani leading-none text-gradient-logo">
            AERO RING TECH
          </span>
          <span className="text-[10px] font-medium tracking-[0.09em] text-text-tertiary whitespace-nowrap leading-none">
            THE ART OF FLIGHT
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={toggle}
        aria-label="Skupi sidebar"
        className="flex items-center justify-center w-8 h-8 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-accent/50"
      >
        <ChevronLeft size={18} strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  );
}

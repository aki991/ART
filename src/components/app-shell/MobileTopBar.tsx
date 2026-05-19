"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Array<[string, string]> = [
  ["/dashboard", "Početna"],
  ["/scanning", "Let uživo"],
  ["/programming", "Programiranje prstenova"],
  ["/pigeons", "Golubovi"],
  ["/races", "Letovi"],
  ["/settings", "Postavke"],
  ["/super-admin", "Super Admin"],
];

interface MobileTopBarProps {
  onMenuClick: () => void;
}

export function MobileTopBar({ onMenuClick }: MobileTopBarProps) {
  const pathname = usePathname();

  const match = PAGE_TITLES.find(
    ([path]) => pathname === path || pathname.startsWith(path + "/")
  );
  const title = match?.[1] ?? "Aero Ring Tech";

  return (
    <header className="sticky top-0 z-30 flex items-center h-14 bg-bg-surface border-b border-border px-4 lg:hidden flex-shrink-0">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Otvori meni"
        className="p-2 -ml-2 text-text-primary hover:bg-bg-hover rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50"
      >
        <Menu className="w-6 h-6" />
      </button>

      <h1 className="flex-1 text-center text-base font-semibold text-text-primary truncate px-2 font-rajdhani">
        {title}
      </h1>

      <div className="w-10" aria-hidden="true" />
    </header>
  );
}

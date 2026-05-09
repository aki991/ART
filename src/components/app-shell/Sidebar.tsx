"use client";

import {
  LayoutDashboard,
  Bird,
  Trophy,
  Radio,
  Zap,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/lib/store/sidebar-store";
import { SidebarLogo } from "./SidebarLogo";
import { SidebarNavLink } from "./SidebarNavLink";
import { SidebarToggle } from "./SidebarToggle";
import { SidebarFooter } from "./SidebarFooter";
import type { NavItem } from "./SidebarNavGroup";

const MAIN_NAV: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/scanning", icon: Radio, label: "Povezivanje uređaja" },
  { href: "/programming", icon: Zap, label: "Programiranje prstenova" },
  { href: "/pigeons", icon: Bird, label: "Golubovi" },
  { href: "/races", icon: Trophy, label: "Trke" },
];

const BOTTOM_NAV: NavItem[] = [
  { href: "/settings", icon: Settings, label: "Postavke" },
];

export function Sidebar() {
  const { expanded, toggle } = useSidebarStore();

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar flex-shrink-0 transition-[width] duration-200 ease-in-out overflow-hidden",
        expanded ? "w-[340px]" : "w-[72px]"
      )}
    >
      <SidebarLogo expanded={expanded} />

      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden py-3 flex flex-col"
        aria-label="Glavna navigacija"
      >
        <ul role="list" className="flex-1">
          {MAIN_NAV.map((item) => (
            <li key={item.href}>
              <SidebarNavLink {...item} />
            </li>
          ))}
        </ul>

        <div
          role="separator"
          aria-orientation="horizontal"
          className="border-t border-white/10 my-2 mx-3"
        />

        <ul role="list">
          {BOTTOM_NAV.map((item) => (
            <li key={item.href}>
              <SidebarNavLink {...item} />
            </li>
          ))}
        </ul>
      </nav>

      <SidebarToggle expanded={expanded} toggle={toggle} />
      <SidebarFooter expanded={expanded} />
    </aside>
  );
}

"use client";

import {
  LayoutDashboard,
  Bird,
  Trophy,
  Radio,
  Target,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/lib/store/sidebar-store";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { SidebarLogo } from "./SidebarLogo";
import { SidebarNavLink } from "./SidebarNavLink";
import { SidebarFooter } from "./SidebarFooter";
import type { NavItem } from "./SidebarNavGroup";

const MAIN_NAV: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Početna" },
  { href: "/scanning", icon: Radio, label: "Trka uživo" },
  { href: "/programming", icon: Target, label: "Programiranje prstenova" },
  { href: "/pigeons", icon: Bird, label: "Golubovi" },
  { href: "/races", icon: Trophy, label: "Rezultati" },
];

const SETTINGS_NAV: NavItem = {
  href: "/settings",
  icon: Settings,
  label: "Postavke",
};

const SUPER_ADMIN_NAV: NavItem = {
  href: "/super-admin/club-requests",
  icon: ShieldCheck,
  label: "Super Admin",
};

export function Sidebar() {
  const { expanded, toggle } = useSidebarStore();
  const user = useCurrentUser();

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-bg-surface border-r border-border flex-shrink-0 transition-[width] duration-200 ease-in-out overflow-hidden",
        expanded ? "w-[240px] xl:w-[340px]" : "w-[72px]"
      )}
    >
      <SidebarLogo expanded={expanded} toggle={toggle} />

      <nav
        className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden py-3"
        aria-label="Glavna navigacija"
      >
        <ul role="list">
          {MAIN_NAV.map((item) => (
            <li key={item.href}>
              <SidebarNavLink {...item} />
            </li>
          ))}
        </ul>

        <div className="flex-1" />

        <div
          role="separator"
          aria-orientation="horizontal"
          className="border-t border-border my-2 mx-3"
        />

        <ul role="list">
          {user.isSuperAdmin && (
            <li>
              <SidebarNavLink {...SUPER_ADMIN_NAV} />
            </li>
          )}
          <li>
            <SidebarNavLink {...SETTINGS_NAV} />
          </li>
        </ul>
      </nav>

      <SidebarFooter expanded={expanded} />
    </aside>
  );
}

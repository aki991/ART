"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarNavLink } from "./SidebarNavLink";

export interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
}

interface SidebarNavGroupProps {
  label: string;
  items: NavItem[];
  expanded: boolean;
}

export function SidebarNavGroup({ label, items, expanded }: SidebarNavGroupProps) {
  return (
    <div className="mb-1">
      <p
        className={cn(
          "px-4 py-2 text-xs font-semibold tracking-widest uppercase text-text-tertiary whitespace-nowrap overflow-hidden transition-all duration-200",
          expanded ? "opacity-100 max-h-8" : "opacity-0 max-h-0 py-0"
        )}
      >
        {label}
      </p>
      <ul role="list">
        {items.map((item) => (
          <li key={item.href}>
            <SidebarNavLink {...item} />
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Radio, Target, Bird, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/scanning", label: "Trka", icon: Radio },
  { href: "/programming", label: "Prsten", icon: Target },
  { href: "/pigeons", label: "Golubovi", icon: Bird },
  { href: "/races", label: "Rezultati", icon: Trophy },
];

export function MobileBottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Glavna navigacija"
      className="fixed bottom-0 left-0 right-0 z-30 flex items-stretch bg-bg-surface border-t border-border lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {TABS.map((tab) => {
        const isActive =
          pathname === tab.href || pathname.startsWith(tab.href + "/");
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 transition-colors",
              isActive
                ? "text-accent"
                : "text-text-tertiary hover:text-text-primary"
            )}
          >
            <Icon className="w-5 h-5" aria-hidden="true" />
            <span className="text-[10px] font-medium leading-none">
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

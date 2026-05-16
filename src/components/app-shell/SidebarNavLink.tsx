"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/lib/store/sidebar-store";

interface SidebarNavLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
}

export function SidebarNavLink({ href, icon: Icon, label }: SidebarNavLinkProps) {
  const pathname = usePathname();
  const expanded = useSidebarStore((s) => s.expanded);

  const isActive =
    pathname === href ||
    (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      title={!expanded ? label : undefined}
      className={cn(
        "flex items-center border-l-[3px] py-3 transition-colors duration-150",
        "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent/50",
        isActive
          ? "border-accent text-accent bg-accent-light"
          : "border-transparent text-text-secondary hover:bg-bg-hover hover:text-text-primary"
      )}
    >
      <div className="flex items-center justify-center w-[52px] xl:w-[60px] 2xl:w-[69px] flex-shrink-0">
        <Icon size={22} strokeWidth={1.6} aria-hidden="true" />
      </div>

      <span
        className={cn(
          "whitespace-nowrap overflow-hidden transition-all duration-200 text-base xl:text-base 2xl:text-lg font-medium font-rajdhani",
          expanded ? "opacity-100 max-w-[260px] pr-4 xl:pr-4 2xl:pr-5" : "opacity-0 max-w-0"
        )}
      >
        {label}
      </span>
    </Link>
  );
}

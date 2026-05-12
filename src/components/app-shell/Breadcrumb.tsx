"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Početna",
  pigeons: "Golubovi",
  races: "Rezultati",
  scanning: "Povezivanje uređaja",
  programming: "Programiranje prstenova",
  settings: "Postavke",
};

export interface BreadcrumbSegment {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  segments?: BreadcrumbSegment[];
}

function buildSegments(pathname: string): BreadcrumbSegment[] {
  const parts = pathname.split("/").filter(Boolean);
  return parts.map((part, i) => {
    const href = "/" + parts.slice(0, i + 1).join("/");
    const isLast = i === parts.length - 1;
    return {
      label: ROUTE_LABELS[part] ?? part,
      href: isLast ? undefined : href,
    };
  });
}

export function Breadcrumb({ segments }: BreadcrumbProps) {
  const pathname = usePathname();
  const resolved = segments ?? buildSegments(pathname);

  if (resolved.length === 0) return null;

  const isOnlySegment = resolved.length === 1;

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5">
        {resolved.map((seg, i) => {
          const isLast = i === resolved.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <ChevronRight size={14} className="text-white/30 flex-shrink-0" />
              )}
              {seg.href ? (
                <Link
                  href={seg.href}
                  className="text-sm text-white/50 hover:text-white transition-colors"
                >
                  {seg.label}
                </Link>
              ) : (
                <span
                  className={
                    isLast && isOnlySegment
                      ? "text-3xl font-semibold text-white font-rajdhani"
                      : "text-sm font-semibold text-white font-rajdhani"
                  }
                >
                  {seg.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

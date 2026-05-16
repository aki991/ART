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
    <nav aria-label="Breadcrumb" className="min-w-0 overflow-hidden">
      <ol className="flex items-center gap-1.5 min-w-0">
        {resolved.map((seg, i) => {
          const isLast = i === resolved.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5 min-w-0">
              {i > 0 && (
                <ChevronRight size={14} className="text-text-tertiary flex-shrink-0" />
              )}
              {seg.href ? (
                <Link
                  href={seg.href}
                  className="text-sm text-text-tertiary hover:text-text-primary transition-colors truncate"
                >
                  {seg.label}
                </Link>
              ) : (
                <span
                  className={
                    isLast && isOnlySegment
                      ? "text-xl xl:text-3xl font-semibold font-rajdhani text-gradient-page-title truncate"
                      : "text-sm font-semibold text-text-primary font-rajdhani truncate"
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

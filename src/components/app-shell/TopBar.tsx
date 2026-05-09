"use client";

import { Breadcrumb } from "./Breadcrumb";
import type { BreadcrumbSegment } from "./Breadcrumb";

interface TopBarProps {
  breadcrumbSegments?: BreadcrumbSegment[];
}

export function TopBar({ breadcrumbSegments }: TopBarProps) {
  return (
    <header className="h-[72px] bg-sky-50 border-b border-sky-200 flex items-center px-6 flex-shrink-0">
      <Breadcrumb segments={breadcrumbSegments} />
    </header>
  );
}

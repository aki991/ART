"use client";

import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarToggleProps {
  expanded: boolean;
  toggle: () => void;
}

export function SidebarToggle({ expanded, toggle }: SidebarToggleProps) {
  return (
    <div className="border-t border-border px-3 py-2 flex justify-end flex-shrink-0">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={expanded}
        aria-label={expanded ? "Skupi sidebar" : "Proširi sidebar"}
        className="p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50"
      >
        <ChevronLeft
          size={18}
          strokeWidth={1.6}
          className={cn(
            "transition-transform duration-200",
            !expanded && "rotate-180"
          )}
        />
      </button>
    </div>
  );
}

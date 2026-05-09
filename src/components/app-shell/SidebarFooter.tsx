"use client";

import { cn } from "@/lib/utils";
import { useConnectionStore } from "@/lib/store/connection-store";

interface SidebarFooterProps {
  expanded: boolean;
}

const STATUS_LABELS = {
  connected: "Povezano",
  connecting: "Povezivanje",
  disconnected: "Nije povezano",
  error: "Greška",
} as const;

export function SidebarFooter({ expanded }: SidebarFooterProps) {
  const status = useConnectionStore((s) => s.status);

  const dotClass = cn(
    "rounded-full border-2 flex-shrink-0",
    status === "connected" && "bg-green-400 border-green-300",
    status === "connecting" && "bg-amber-400 border-amber-300 animate-pulse",
    status === "disconnected" && "bg-gray-400 border-gray-300",
    status === "error" && "bg-red-400 border-red-300"
  );

  return (
    <div className="border-t border-white/10 p-4 flex items-center justify-between gap-3 flex-shrink-0">
      {/* Levi deo: avatar + ime/uloga */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-cyan-brand/20 border border-cyan-brand/40 flex items-center justify-center text-cyan-brand text-base font-semibold font-rajdhani">
            A
          </div>
          {!expanded && (
            <span
              className={cn("absolute bottom-0 right-0 w-4 h-4 border-sidebar", dotClass)}
              aria-hidden="true"
              title={`Status: ${STATUS_LABELS[status]}`}
            />
          )}
        </div>

        {expanded && (
          <div className="min-w-0">
            <p className="text-white text-base font-medium whitespace-nowrap font-rajdhani">
              Andreja
            </p>
            <p className="text-white/40 text-xs whitespace-nowrap">DEV USER</p>
          </div>
        )}
      </div>

      {/* Desni deo: connection status (samo kad je expanded) */}
      {expanded && (
        <div
          className="flex items-center gap-2.5 flex-shrink-0"
          aria-label={`Status: ${STATUS_LABELS[status]}`}
        >
          <span className={cn("w-3.5 h-3.5", dotClass)} aria-hidden="true" />
          <span className="text-base font-semibold text-white/85 whitespace-nowrap">
            {STATUS_LABELS[status]}
          </span>
        </div>
      )}
    </div>
  );
}

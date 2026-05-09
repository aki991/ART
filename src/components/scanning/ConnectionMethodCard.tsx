"use client";

import { Cable, Bluetooth, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useConnectionStore } from "@/lib/store/connection-store";

interface ConnectionMethodCardProps {
  method: "usb-c" | "bluetooth";
  title: string;
  description: string;
  accentColor: "cyan" | "blue";
  disabled?: boolean;
}

const METHOD_ICON = {
  "usb-c": Cable,
  bluetooth: Bluetooth,
} as const;

export function ConnectionMethodCard({
  method,
  title,
  description,
  accentColor,
  disabled = false,
}: ConnectionMethodCardProps) {
  const connectWithMethod = useConnectionStore((s) => s.connectWithMethod);
  const Icon = METHOD_ICON[method];

  const iconStyles =
    accentColor === "cyan"
      ? "bg-cyan-brand/10 text-cyan-brand"
      : "bg-blue-100 text-blue-600";

  const arrowHover =
    accentColor === "cyan"
      ? "group-hover:text-cyan-brand"
      : "group-hover:text-blue-600";

  async function handleActivate() {
    if (disabled) return;
    try {
      await connectWithMethod(method);
      toast.success("Uspešno povezano", {
        description: `Aktiviran je ${title} mod sa baznim uređajem.`,
      });
    } catch {
      toast.error("Povezivanje neuspešno", {
        description: "Pokušajte ponovo.",
      });
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      void handleActivate();
    }
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={`Poveži preko ${title} — ${description}`}
      aria-disabled={disabled}
      onClick={() => void handleActivate()}
      onKeyDown={handleKeyDown}
      className={cn(
        "card-redesign group flex items-center min-h-[140px] p-6",
        disabled
          ? "opacity-60 cursor-not-allowed"
          : "card-redesign-interactive cursor-pointer"
      )}
    >
      <div
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0",
          iconStyles
        )}
      >
        <Icon className="w-7 h-7" aria-hidden="true" />
      </div>
      <div className="flex-1 ml-4">
        <p className="text-xl font-semibold font-rajdhani text-gray-900">{title}</p>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      <ArrowRight
        className={cn(
          "w-5 h-5 text-gray-400 flex-shrink-0 transition-colors duration-200",
          arrowHover
        )}
        aria-hidden="true"
      />
    </div>
  );
}

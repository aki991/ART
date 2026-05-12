"use client";

import { Cable, Bluetooth } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useConnectionStore } from "@/lib/store/connection-store";

interface ConnectionMethodCardProps {
  method: "usb-c" | "bluetooth";
  title: string;
  disabled?: boolean;
}

const METHOD_ICON = {
  "usb-c": Cable,
  bluetooth: Bluetooth,
} as const;

export function ConnectionMethodCard({
  method,
  title,
  disabled = false,
}: ConnectionMethodCardProps) {
  const connectWithMethod = useConnectionStore((s) => s.connectWithMethod);
  const Icon = METHOD_ICON[method];

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
      aria-label={`Poveži preko ${title}`}
      aria-disabled={disabled}
      onClick={() => void handleActivate()}
      onKeyDown={handleKeyDown}
      className={cn(
        "w-[200px] h-[200px] rounded-full flex flex-col items-center justify-center gap-3",
        "bg-white border border-cyan-brand/15 transition-all duration-200",
        disabled
          ? "opacity-60 cursor-not-allowed"
          : "cursor-pointer hover:border-cyan-brand/50 hover:shadow-lg hover:shadow-cyan-brand/10"
      )}
    >
      <Icon className="w-14 h-14 text-cyan-brand" strokeWidth={1.5} aria-hidden="true" />
      <span className="text-xl font-semibold font-rajdhani text-gray-900">
        {title}
      </span>
    </div>
  );
}

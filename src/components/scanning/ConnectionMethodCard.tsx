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
  const currentMethod = useConnectionStore((s) => s.method);
  const status = useConnectionStore((s) => s.status);
  const Icon = METHOD_ICON[method];

  const isActive = currentMethod === method && status === "connecting";

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
        "bg-card-dark border shadow-[0_1px_3px_rgba(0,0,0,0.12)] transition-all duration-200",
        isActive
          ? "border-cyan-brand shadow-[0_0_24px_rgba(0,210,255,0.25)]"
          : "border-white/5",
        disabled
          ? "opacity-60 cursor-not-allowed"
          : "cursor-pointer hover:bg-card-dark-hover hover:border-cyan-brand/40 hover:shadow-[0_8px_24px_rgba(0,210,255,0.08)]"
      )}
    >
      <Icon
        className={cn("w-14 h-14", isActive ? "text-cyan-brand" : "text-white/70")}
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <span className={cn("text-xl font-semibold font-rajdhani", isActive ? "text-cyan-brand" : "text-white")}>
        {title}
      </span>
    </div>
  );
}

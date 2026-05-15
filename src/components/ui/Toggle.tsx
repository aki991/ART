"use client";

import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
}

export function Toggle({
  checked,
  onChange,
  disabled = false,
  label,
  id,
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface",
        checked ? "bg-accent" : "bg-bg-active",
        disabled && "opacity-40 pointer-events-none"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 rounded-full transition-all duration-200 ease-in-out shadow-sm",
          checked ? "translate-x-6 bg-white" : "translate-x-1 bg-bg-surface"
        )}
      />
    </button>
  );
}

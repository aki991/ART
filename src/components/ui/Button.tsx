"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "btn-shine-redesign bg-accent text-text-on-accent font-bold hover:bg-accent-hover disabled:bg-bg-disabled disabled:text-text-disabled",
  secondary:
    "bg-bg-surface border border-border text-text-secondary font-medium hover:bg-bg-hover disabled:opacity-40",
  danger:
    "bg-bg-error-light border border-status-error/40 text-status-error font-medium hover:bg-status-error/20 disabled:opacity-40",
  ghost:
    "text-text-tertiary font-medium hover:text-text-primary hover:bg-bg-hover disabled:opacity-40",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-md gap-1.5",
  md: "px-5 py-3 text-base rounded-md gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    disabled,
    className,
    children,
    type = "button",
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center transition-colors disabled:cursor-not-allowed",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
});

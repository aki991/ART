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
    "btn-shine-redesign bg-cyan-brand text-sidebar font-bold hover:bg-cyan-dark disabled:bg-white/10 disabled:text-white/30",
  secondary:
    "bg-white/5 border border-white/10 text-white/80 font-medium hover:bg-white/10 disabled:opacity-40",
  danger:
    "bg-red-500/10 border border-red-500/40 text-red-400 font-medium hover:bg-red-500/20 disabled:opacity-40",
  ghost:
    "text-white/60 font-medium hover:text-white hover:bg-white/5 disabled:opacity-40",
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

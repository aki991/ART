"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, required, id, className, containerClassName, ...props },
  ref
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const describedBy = error
    ? `${inputId}-error`
    : hint
      ? `${inputId}-hint`
      : undefined;

  return (
    <div className={cn("w-full", containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-base font-medium text-white/80 mb-1.5"
        >
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "w-full px-4 py-2.5 bg-white/5 border rounded-md text-base text-white placeholder:text-white/30 focus:ring-2 focus:outline-none transition-colors",
          error
            ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
            : "border-white/10 focus:border-cyan-brand focus:ring-cyan-brand/20",
          className
        )}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1 text-sm text-white/40">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

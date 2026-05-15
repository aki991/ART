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
          className="block text-base font-medium text-text-secondary mb-1.5"
        >
          {label}
          {required && <span className="text-status-error ml-0.5">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "w-full px-4 py-2.5 bg-bg-input border rounded-md text-base text-text-primary placeholder:text-text-disabled focus:ring-2 focus:outline-none transition-colors",
          error
            ? "border-status-error/60 focus:border-status-error focus:ring-status-error/20"
            : "border-border focus:border-accent focus:ring-accent/20",
          className
        )}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-status-error">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1 text-sm text-text-tertiary">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

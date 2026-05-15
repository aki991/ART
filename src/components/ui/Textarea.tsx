"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { label, error, hint, required, id, className, containerClassName, ...props },
    ref
  ) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const describedBy = error
      ? `${fieldId}-error`
      : hint
        ? `${fieldId}-hint`
        : undefined;

    return (
      <div className={cn("w-full", containerClassName)}>
        {label && (
          <label
            htmlFor={fieldId}
            className="block text-base font-medium text-text-secondary mb-1.5"
          >
            {label}
            {required && <span className="text-status-error ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "w-full px-4 py-2.5 bg-bg-input border rounded-md text-base text-text-primary placeholder:text-text-disabled focus:ring-2 focus:outline-none transition-colors resize-y min-h-[96px]",
            error
              ? "border-status-error/60 focus:border-status-error focus:ring-status-error/20"
              : "border-border focus:border-accent focus:ring-accent/20",
            className
          )}
          {...props}
        />
        {error ? (
          <p id={`${fieldId}-error`} className="mt-1 text-sm text-status-error">
            {error}
          </p>
        ) : hint ? (
          <p id={`${fieldId}-hint`} className="mt-1 text-sm text-text-tertiary">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

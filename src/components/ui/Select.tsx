"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  onBlur?: () => void;
  id?: string;
}

export function Select({
  options,
  value,
  onChange,
  label,
  placeholder = "Izaberite...",
  error,
  onBlur,
  id,
}: SelectProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [portalReady, setPortalReady] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => setPortalReady(true), []);

  const selected = options.find((o) => o.value === value) ?? null;

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const update = () => {
      if (triggerRef.current) {
        setRect(triggerRef.current.getBoundingClientRect());
      }
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      const inTrigger = triggerRef.current?.contains(e.target as Node);
      const inPortal = portalRef.current?.contains(e.target as Node);
      if (!inTrigger && !inPortal) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (open) setHighlighted(options.findIndex((o) => o.value === value));
  }, [open, options, value]);

  useEffect(() => {
    if (highlighted < 0 || !listRef.current) return;
    const item = listRef.current.children[highlighted] as
      | HTMLElement
      | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  function openDropdown() {
    if (triggerRef.current) {
      setRect(triggerRef.current.getBoundingClientRect());
    }
    setOpen(true);
  }

  function selectOption(optValue: string) {
    onChange(optValue);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openDropdown();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlighted((i) => Math.min(i + 1, options.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlighted((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (highlighted >= 0 && options[highlighted]) {
          selectOption(options[highlighted].value);
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={fieldId}
          className="block text-base font-medium text-white/80 mb-1.5"
        >
          {label}
        </label>
      )}
      <button
        ref={triggerRef}
        id={fieldId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${fieldId}-listbox`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        onClick={() => (open ? setOpen(false) : openDropdown())}
        onKeyDown={handleKeyDown}
        onBlur={onBlur}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-white/5 border rounded-md text-base text-left text-white focus:ring-2 focus:outline-none transition-colors",
          error
            ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
            : "border-white/10 focus:border-cyan-brand focus:ring-cyan-brand/20"
        )}
      >
        <span className={cn(!selected && "text-white/30")}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-white/40 transition-transform flex-shrink-0",
            open && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      {error && (
        <p id={`${fieldId}-error`} className="mt-1 text-sm text-red-400">
          {error}
        </p>
      )}

      {portalReady &&
        open &&
        rect &&
        createPortal(
          <div
            ref={portalRef}
            id={`${fieldId}-listbox`}
            role="listbox"
            style={{
              position: "fixed",
              top: rect.bottom + 4,
              left: rect.left,
              width: rect.width,
              zIndex: 80,
            }}
            className="bg-[#0B1E2E] border border-white/10 rounded-md shadow-[0_8px_32px_rgba(0,0,0,0.7)] max-h-60 overflow-y-auto py-1"
          >
            <div ref={listRef}>
              {options.map((opt, index) => {
                const isSelected = opt.value === value;
                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectOption(opt.value);
                    }}
                    onMouseEnter={() => setHighlighted(index)}
                    className={cn(
                      "px-4 py-2.5 cursor-pointer text-base flex items-center justify-between gap-2 border-l-2 transition-colors",
                      highlighted === index
                        ? "bg-white/10 border-l-cyan-brand text-white"
                        : "border-l-transparent text-white/70"
                    )}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <Check
                        className="w-4 h-4 text-cyan-brand flex-shrink-0"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

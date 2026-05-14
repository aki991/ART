"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  emptyText?: string;
  label?: string;
  id?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Pretraži...",
  emptyText = "Nema rezultata",
  label,
  id,
}: SearchableSelectProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(-1);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [portalReady, setPortalReady] = useState(false);

  const anchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => setPortalReady(true), []);

  const selectedOption = useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.sublabel?.toLowerCase().includes(q) ?? false)
    );
  }, [options, query]);

  const displayValue = open ? query : selectedOption ? selectedOption.label : "";

  useEffect(() => {
    if (!open || !anchorRef.current) return;
    const update = () => {
      if (anchorRef.current) setRect(anchorRef.current.getBoundingClientRect());
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
      const inAnchor = anchorRef.current?.contains(e.target as Node);
      const inPortal = portalRef.current?.contains(e.target as Node);
      if (!inAnchor && !inPortal) {
        setOpen(false);
        setQuery("");
        setHighlighted(-1);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (highlighted < 0 || !listRef.current) return;
    const item = listRef.current.children[highlighted] as
      | HTMLElement
      | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  function openDropdown() {
    if (anchorRef.current) setRect(anchorRef.current.getBoundingClientRect());
    setOpen(true);
  }

  function selectOption(optValue: string) {
    onChange(optValue);
    setOpen(false);
    setQuery("");
    setHighlighted(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        e.preventDefault();
        openDropdown();
        setHighlighted(0);
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlighted((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlighted((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (highlighted >= 0 && filtered[highlighted]) {
          selectOption(filtered[highlighted].value);
        }
        break;
      case "Escape":
        setOpen(false);
        setQuery("");
        setHighlighted(-1);
        inputRef.current?.blur();
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
      <div className="relative" ref={anchorRef}>
        <input
          ref={inputRef}
          id={fieldId}
          type="text"
          value={displayValue}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) openDropdown();
            setHighlighted(0);
          }}
          onFocus={openDropdown}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${fieldId}-listbox`}
          aria-autocomplete="list"
          className="w-full px-4 py-2.5 pr-16 bg-white/5 border border-white/10 rounded-md text-base text-white placeholder:text-white/30 focus:border-cyan-brand focus:ring-2 focus:ring-cyan-brand/20 focus:outline-none transition-colors"
        />
        {value && !open ? (
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              onChange(null);
              setQuery("");
            }}
            aria-label="Obriši izbor"
            className="absolute right-9 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <Search className="absolute right-9 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
        )}
        <button
          type="button"
          tabIndex={-1}
          onMouseDown={(e) => {
            e.preventDefault();
            if (open) {
              setOpen(false);
              setQuery("");
            } else {
              openDropdown();
              inputRef.current?.focus();
            }
          }}
          aria-label={open ? "Zatvori listu" : "Otvori listu"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
        >
          <ChevronDown
            className={cn("w-4 h-4 transition-transform", open && "rotate-180")}
          />
        </button>
      </div>

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
            className="bg-[#0B1E2E] border border-white/10 rounded-md shadow-[0_8px_32px_rgba(0,0,0,0.7)] max-h-60 overflow-y-auto"
          >
            <div ref={listRef}>
              {filtered.length === 0 ? (
                <div className="px-4 py-3 text-white/40 text-sm italic">
                  {emptyText}
                </div>
              ) : (
                filtered.map((opt, index) => (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={opt.value === value}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectOption(opt.value);
                    }}
                    onMouseEnter={() => setHighlighted(index)}
                    className={cn(
                      "px-4 py-2.5 cursor-pointer text-base border-l-2 transition-colors",
                      highlighted === index
                        ? "bg-white/10 border-l-cyan-brand text-white"
                        : "border-l-transparent text-white/70 hover:bg-white/5"
                    )}
                  >
                    <span className="font-medium">{opt.label}</span>
                    {opt.sublabel && (
                      <span className="text-white/50 ml-2 text-sm">
                        — {opt.sublabel}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

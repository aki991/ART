"use client";

import { useState, useEffect, useRef } from "react";
import { Building2 } from "lucide-react";

interface SelectFieldProps {
  placeholder: string;
  name: string;
  value: string;
  onChange: (e: { target: { value: string } }) => void;
  options: string[];
  required?: boolean;
}

export default function SelectField({
  placeholder,
  name,
  value,
  onChange,
  options,
  required,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (v: string) => {
    onChange({ target: { value: v } });
    setOpen(false);
  };

  return (
    <div
      ref={ref}
      className={`mfield mselect ${open ? "is-focus is-open" : ""} ${value ? "is-filled" : ""}`}
    >
      <button
        type="button"
        className="mfield-wrap mselect-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        id={name}
      >
        <span className="mfield-icon">
          <Building2 size={18} strokeWidth={1.6} />
        </span>
        <span className={`mselect-value ${value ? "" : "is-placeholder"}`}>
          {value || placeholder + (required ? " *" : "")}
        </span>
        <span className="mfield-chevron">▾</span>
      </button>
      {open && (
        <ul className="mselect-menu" role="listbox">
          {options.map((o) => (
            <li
              key={o}
              role="option"
              aria-selected={value === o}
              className={`mselect-option ${value === o ? "is-active" : ""}`}
              onClick={() => choose(o)}
            >
              {o}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

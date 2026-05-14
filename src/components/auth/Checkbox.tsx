"use client";

import { Check } from "lucide-react";

interface CheckboxProps {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  children: React.ReactNode;
}

export default function Checkbox({ checked, onChange, children }: CheckboxProps) {
  return (
    <label className="mcheckbox">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="mcheck-box">
        <span className="mcheck-mark">
          <Check size={11} strokeWidth={1.6} />
        </span>
      </span>
      <span className="mcheck-label">{children}</span>
    </label>
  );
}

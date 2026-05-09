"use client";

import { useState } from "react";
import { Mail, Lock, User, CreditCard, Eye, EyeOff } from "lucide-react";

type IconName = "mail" | "lock" | "user" | "id";

const iconMap: Record<IconName, React.ReactNode> = {
  mail: <Mail size={18} strokeWidth={1.6} />,
  lock: <Lock size={18} strokeWidth={1.6} />,
  user: <User size={18} strokeWidth={1.6} />,
  id: <CreditCard size={18} strokeWidth={1.6} />,
};

interface TextFieldProps {
  placeholder: string;
  name: string;
  type?: "text" | "email" | "password";
  icon: IconName;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  required?: boolean;
}

export default function TextField({
  placeholder,
  name,
  type = "text",
  icon,
  value,
  onChange,
  autoComplete,
  required,
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  const realType = isPass && show ? "text" : type;

  return (
    <div className={`mfield ${focused ? "is-focus" : ""} ${value ? "is-filled" : ""}`}>
      <div className="mfield-wrap">
        <span className="mfield-icon">{iconMap[icon]}</span>
        <input
          id={name}
          name={name}
          type={realType}
          value={value}
          onChange={onChange}
          placeholder={placeholder + (required ? " *" : "")}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {isPass && (
          <button
            type="button"
            className="mfield-eye"
            onClick={() => setShow((s) => !s)}
            tabIndex={-1}
            aria-label="prikaži lozinku"
          >
            {show ? <EyeOff size={16} strokeWidth={1.6} /> : <Eye size={16} strokeWidth={1.6} />}
          </button>
        )}
      </div>
    </div>
  );
}

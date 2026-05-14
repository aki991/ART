"use client";

import type { Lang } from "./translations";

const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "sr", label: "Srpski", flag: "🇷🇸" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
];

interface LanguageSelectorProps {
  value: Lang;
  onChange: (lang: Lang) => void;
}

export default function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <div className="lang-selector">
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          className={`lang-flag ${value === l.code ? "active" : ""}`}
          onClick={() => onChange(l.code)}
          title={l.label}
          aria-label={l.label}
        >
          <span className="lang-flag-emoji">{l.flag}</span>
        </button>
      ))}
    </div>
  );
}

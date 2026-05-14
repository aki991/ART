"use client";

import { cn } from "@/lib/utils";
import { Select, type SelectOption } from "@/components/ui/Select";
import type {
  AppearancePrefs,
  LanguagePref,
  ThemePref,
} from "@/lib/settings/types";

interface AppearanceTabProps {
  value: AppearancePrefs;
  onChange: (next: AppearancePrefs) => void;
}

const LANGUAGE_OPTIONS: SelectOption[] = [
  { value: "sr-Latn", label: "Srpski (latinica)" },
  { value: "sr-Cyrl", label: "Srpski (ćirilica)" },
];

export function AppearanceTab({ value, onChange }: AppearanceTabProps) {
  function setTheme(theme: ThemePref) {
    onChange({ ...value, theme });
  }

  function setLanguage(language: LanguagePref) {
    onChange({ ...value, language });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Theme */}
      <div className="card-redesign p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white font-rajdhani">
            Tema
          </h2>
          <p className="text-sm text-white/50 mt-0.5">
            Izaberite kako će aplikacija izgledati.
          </p>
        </div>
        <div
          role="radiogroup"
          aria-label="Tema aplikacije"
          className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1 gap-1"
        >
          <button
            type="button"
            role="radio"
            aria-checked={value.theme === "dark"}
            onClick={() => setTheme("dark")}
            className={cn(
              "px-5 py-2 rounded-md text-base font-medium transition-colors",
              value.theme === "dark"
                ? "bg-cyan-brand/15 border border-cyan-brand/50 text-cyan-brand"
                : "border border-transparent text-white/60 hover:text-white"
            )}
          >
            Tamna
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={false}
            aria-disabled={true}
            disabled
            title="Svetla tema će biti dostupna uskoro"
            className="px-5 py-2 rounded-md text-base font-medium text-white/60 border border-transparent opacity-40 cursor-not-allowed inline-flex items-center gap-2"
          >
            Svetla
            <span className="text-[10px] uppercase tracking-wide bg-white/10 text-white/70 px-1.5 py-0.5 rounded">
              Uskoro
            </span>
          </button>
        </div>
      </div>

      {/* Language */}
      <div className="card-redesign p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white font-rajdhani">
            Jezik
          </h2>
          <p className="text-sm text-white/50 mt-0.5">
            Izaberite jezik aplikacije.
          </p>
        </div>
        <Select
          label="Jezik aplikacije"
          options={LANGUAGE_OPTIONS}
          value={value.language}
          onChange={(v) => setLanguage(v as LanguagePref)}
        />
        <p className="text-sm text-white/40">
          Prevod aplikacije će biti aktiviran u narednom ažuriranju. Vaša
          preferencija je sačuvana.
        </p>
      </div>
    </div>
  );
}

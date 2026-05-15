"use client";

import { cn } from "@/lib/utils";
import { Select, type SelectOption } from "@/components/ui/Select";
import { useTheme } from "@/components/theme/ThemeProvider";
import type {
  AppearancePrefs,
  LanguagePref,
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
  const { theme, setTheme } = useTheme();

  function setLanguage(language: LanguagePref) {
    onChange({ ...value, language });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Theme */}
      <div className="card-redesign p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary font-rajdhani">
            Tema
          </h2>
          <p className="text-sm text-text-tertiary mt-0.5">
            Izaberite kako će aplikacija izgledati.
          </p>
        </div>
        <div
          role="radiogroup"
          aria-label="Tema aplikacije"
          className="inline-flex rounded-lg border border-border bg-bg-input p-1 gap-1"
        >
          <button
            type="button"
            role="radio"
            aria-checked={theme === "dark"}
            onClick={() => setTheme("dark")}
            className={cn(
              "px-5 py-2 rounded-md text-base font-medium transition-colors",
              theme === "dark"
                ? "bg-accent text-text-on-accent"
                : "text-text-secondary hover:bg-bg-hover"
            )}
          >
            Tamna
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={theme === "light"}
            onClick={() => setTheme("light")}
            className={cn(
              "px-5 py-2 rounded-md text-base font-medium transition-colors",
              theme === "light"
                ? "bg-accent text-text-on-accent"
                : "text-text-secondary hover:bg-bg-hover"
            )}
          >
            Svetla
          </button>
        </div>
      </div>

      {/* Language */}
      <div className="card-redesign p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary font-rajdhani">
            Jezik
          </h2>
          <p className="text-sm text-text-tertiary mt-0.5">
            Izaberite jezik aplikacije.
          </p>
        </div>
        <Select
          label="Jezik aplikacije"
          options={LANGUAGE_OPTIONS}
          value={value.language}
          onChange={(v) => setLanguage(v as LanguagePref)}
        />
        <p className="text-sm text-text-disabled">
          Prevod aplikacije će biti aktiviran u narednom ažuriranju. Vaša
          preferencija je sačuvana.
        </p>
      </div>
    </div>
  );
}

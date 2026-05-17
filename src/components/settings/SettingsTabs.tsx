"use client";

import { cn } from "@/lib/utils";

export interface SettingsTab {
  id: string;
  label: string;
}

interface SettingsTabsProps {
  tabs: SettingsTab[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function SettingsTabs({ tabs, activeTab, onChange }: SettingsTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Sekcije postavki"
      className="flex flex-wrap gap-1 border-b border-border mb-6 max-lg:grid max-lg:grid-cols-3 max-lg:gap-0 max-lg:mb-4"
    >
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            id={`settings-tab-${tab.id}`}
            aria-selected={active}
            aria-controls={`settings-panel-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={cn(
              "px-4 py-2.5 text-base font-medium -mb-px border-b-2 transition-colors",
              "max-lg:px-1 max-lg:py-2 max-lg:text-sm max-lg:text-center",
              active
                ? "border-accent text-text-primary"
                : "border-transparent text-text-tertiary hover:text-text-secondary hover:border-border-strong"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

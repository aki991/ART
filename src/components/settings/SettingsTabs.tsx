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
      className="flex flex-wrap gap-1 border-b border-border mb-6"
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

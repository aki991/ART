"use client";

import { Button } from "@/components/ui/Button";

interface SettingsFooterProps {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

export function SettingsFooter({
  dirty,
  saving,
  onSave,
  onDiscard,
}: SettingsFooterProps) {
  return (
    <div className="sticky bottom-0 z-20 -mx-6 px-6 py-4 mt-6 border-t border-border bg-white dark:bg-[#0F2030] shadow-lg flex items-center justify-between gap-4 max-lg:fixed max-lg:bottom-[calc(50px+env(safe-area-inset-bottom))] max-lg:left-0 max-lg:right-0 max-lg:mx-0 max-lg:mt-0 max-lg:px-3 max-lg:py-2 max-lg:gap-2">
      <p className="text-sm text-text-disabled max-lg:text-[11px]">
        {dirty ? "Imate nesačuvane izmene." : "Sve izmene su sačuvane."}
      </p>
      <div className="flex items-center gap-3 max-lg:gap-2">
        <Button
          variant="secondary"
          onClick={onDiscard}
          disabled={!dirty || saving}
          className="max-lg:!px-3 max-lg:!py-1.5 max-lg:!text-xs"
        >
          Odustani
        </Button>
        <Button
          variant="primary"
          onClick={onSave}
          disabled={!dirty}
          loading={saving}
          className="max-lg:!px-3 max-lg:!py-1.5 max-lg:!text-xs"
        >
          Sačuvaj promene
        </Button>
      </div>
    </div>
  );
}

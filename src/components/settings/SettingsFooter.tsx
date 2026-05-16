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
    <div className="sticky bottom-0 z-20 -mx-6 px-6 py-4 mt-6 border-t border-border bg-white dark:bg-[#0F2030] shadow-lg flex items-center justify-between gap-4">
      <p className="text-sm text-text-disabled">
        {dirty ? "Imate nesačuvane izmene." : "Sve izmene su sačuvane."}
      </p>
      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          onClick={onDiscard}
          disabled={!dirty || saving}
        >
          Odustani
        </Button>
        <Button
          variant="primary"
          onClick={onSave}
          disabled={!dirty}
          loading={saving}
        >
          Sačuvaj promene
        </Button>
      </div>
    </div>
  );
}

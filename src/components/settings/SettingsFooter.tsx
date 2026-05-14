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
    <div className="sticky bottom-0 -mx-6 px-6 py-4 mt-6 border-t border-white/10 bg-app-surface/95 backdrop-blur-sm flex items-center justify-between gap-4">
      <p className="text-sm text-white/40">
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

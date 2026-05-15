"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2, Plus } from "lucide-react";
import {
  SearchableSelect,
  type SelectOption,
} from "@/components/ui/SearchableSelect";
import { Button } from "@/components/ui/Button";
import { sendJoinRequest } from "@/app/actions/clubs";
import type { ClubRow } from "@/app/actions/club-types";
import { CreateClubRequestModal } from "../modals/CreateClubRequestModal";

interface ClubBrowserProps {
  clubs: ClubRow[];
}

export function ClubBrowser({ clubs }: ClubBrowserProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const options: SelectOption[] = clubs.map((c) => ({
    value: c.id,
    label: c.name,
    sublabel: c.city,
  }));
  const selected = clubs.find((c) => c.id === selectedId) ?? null;

  function handleSendRequest() {
    if (!selected) return;
    startTransition(async () => {
      const result = await sendJoinRequest(selected.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Zahtev za članstvo poslat", {
        description: `Zahtev je poslat administratoru kluba ${selected.name}.`,
      });
      router.refresh();
    });
  }

  return (
    <div className="card-redesign p-6 space-y-5 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold text-text-primary font-rajdhani">
          Niste član nijednog kluba
        </h2>
        <p className="text-sm text-text-tertiary mt-0.5">
          Pronađite svoj klub i pošaljite zahtev za članstvo, ili kreirajte
          novi.
        </p>
      </div>

      <SearchableSelect
        label="Pretraži klubove"
        options={options}
        value={selectedId}
        onChange={setSelectedId}
        placeholder="Ukucajte naziv kluba..."
        emptyText="Nema klubova za tu pretragu"
      />

      {selected && (
        <div className="rounded-lg border border-border bg-bg-hover p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-accent-light border border-accent/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {selected.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selected.logo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-5 h-5 text-accent" aria-hidden="true" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-text-primary font-medium truncate">{selected.name}</p>
              <p className="text-sm text-text-tertiary truncate">{selected.city}</p>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={handleSendRequest}
            disabled={pending}
            className="flex-shrink-0"
          >
            Pošalji zahtev za članstvo
          </Button>
        </div>
      )}

      <div className="pt-3 border-t border-border">
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-cyan-bright transition-colors"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Ili kreiraj novi klub
        </button>
      </div>

      <CreateClubRequestModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}

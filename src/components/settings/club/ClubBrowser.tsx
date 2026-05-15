"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Building2, Plus } from "lucide-react";
import {
  SearchableSelect,
  type SelectOption,
} from "@/components/ui/SearchableSelect";
import { Button } from "@/components/ui/Button";
import { useSettingsStore } from "@/lib/store/settings-store";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { getMockMemberCount } from "@/lib/data/mock-clubs";
import { CreateClubModal } from "../modals/CreateClubModal";

export function ClubBrowser() {
  const clubs = useSettingsStore((s) => s.clubs);
  const sendJoinRequest = useSettingsStore((s) => s.sendJoinRequest);
  const user = useCurrentUser();

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
    sendJoinRequest(selected.id, {
      firstName: user.profile?.firstName ?? "",
      lastName: user.profile?.lastName ?? "",
      username: user.profile?.username ?? "",
      avatar: user.profile?.avatarUrl ?? null,
    });
    toast.success("Zahtev za članstvo poslat", {
      description: `Zahtev je poslat administratoru kluba ${selected.name}.`,
    });
  }

  return (
    <div className="card-redesign p-6 space-y-5 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold text-white font-rajdhani">
          Niste član nijednog kluba
        </h2>
        <p className="text-sm text-white/50 mt-0.5">
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
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-cyan-brand/15 border border-cyan-brand/30 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-cyan-brand" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-medium truncate">{selected.name}</p>
              <p className="text-sm text-white/50 truncate">
                {selected.city} · {getMockMemberCount(selected.id)} članova
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={handleSendRequest}
            className="flex-shrink-0"
          >
            Pošalji zahtev za članstvo
          </Button>
        </div>
      )}

      <div className="pt-3 border-t border-white/5">
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-1.5 text-sm text-cyan-brand hover:text-cyan-bright transition-colors"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Ili kreiraj novi klub
        </button>
      </div>

      <CreateClubModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}

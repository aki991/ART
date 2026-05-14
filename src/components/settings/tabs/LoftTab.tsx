"use client";

import { Info } from "lucide-react";
import { Input } from "@/components/ui/Input";
import type { LoftData } from "@/lib/settings/types";

interface LoftTabProps {
  value: LoftData;
  onChange: (next: LoftData) => void;
}

export function LoftTab({ value, onChange }: LoftTabProps) {
  return (
    <div className="card-redesign p-6 space-y-5 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold text-white font-rajdhani">
          Golubarnik
        </h2>
        <p className="text-sm text-white/50 mt-0.5">
          Podaci o lokaciji vašeg golubarnika.
        </p>
      </div>

      <Input
        label="Adresa golubarnika"
        value={value.address}
        onChange={(e) => onChange({ ...value, address: e.target.value })}
        placeholder="npr. Ulica i broj"
      />

      <Input
        label="Grad"
        value={value.city}
        onChange={(e) => onChange({ ...value, city: e.target.value })}
        placeholder="npr. Velika Plana"
      />

      <div className="flex gap-2.5 rounded-md bg-cyan-brand/5 border border-cyan-brand/15 p-3.5">
        <Info
          className="w-4 h-4 text-cyan-brand/70 flex-shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <p className="text-sm text-white/60 leading-relaxed">
          Adresa golubarnika koristi se za buduće funkcije praćenja udaljenosti i
          lokalnih takmičenja. Ne deli se javno bez vaše saglasnosti.
        </p>
      </div>
    </div>
  );
}

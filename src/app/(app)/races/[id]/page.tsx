import type { Metadata } from "next";
import Link from "next/link";
import { getRaceById } from "@/app/actions/races";
import { RaceDetailView } from "@/components/races/RaceDetailView";

export const metadata: Metadata = {
  title: "Detalji trke — Aero Ring Tech",
};

export const dynamic = "force-dynamic";

export default async function RaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getRaceById(id);
  const race = res.success ? res.data : null;

  if (!race) {
    return (
      <div className="px-6 py-6">
        <div className="bg-bg-surface border border-accent/15 rounded-xl p-12 text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-2 font-rajdhani">
            Trka nije pronađena
          </h2>
          <p className="text-text-tertiary mb-4">
            Možda je obrisana ili nemate dozvolu za pregled.
          </p>
          <Link
            href="/races"
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-md transition-colors inline-block"
          >
            Vrati se na listu
          </Link>
        </div>
      </div>
    );
  }

  return <RaceDetailView race={race} />;
}

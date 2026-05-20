import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPigeonStats } from "@/app/actions/pigeons";
import { PigeonStatsClient } from "@/components/pigeons/PigeonStatsClient";

export const metadata: Metadata = {
  title: "Statistike goluba — Aero Ring Tech",
};

export const dynamic = "force-dynamic";

export default async function PigeonStatsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getPigeonStats(id);

  if (!data) {
    notFound();
  }

  return <PigeonStatsClient data={data} />;
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { getPublicProfile } from "@/app/actions/profile";

export const dynamic = "force-dynamic";

function displayName(profile: {
  first_name: string;
  last_name: string;
  username: string;
}): string {
  return (
    `${profile.first_name} ${profile.last_name}`.trim() || profile.username
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublicProfile(username);
  if (!profile) {
    return { title: "Profil nije pronađen — Aero Ring Tech" };
  }
  const name = displayName(profile);
  return {
    title: `${name} (@${profile.username}) — Aero Ring Tech`,
    description: profile.bio || `Profil golubara ${name} na Aero Ring Tech.`,
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getPublicProfile(username);

  if (!profile) {
    notFound();
  }

  const name = displayName(profile);

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-bg-surface">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3 min-w-0">
            <Image
              src="/art-logo.png"
              alt="Aero Ring Tech"
              width={36}
              height={36}
              priority
            />
            <div className="leading-none min-w-0">
              <div className="text-sm font-bold tracking-wide font-rajdhani text-gradient-logo">
                AERO RING TECH
              </div>
              <div className="text-[9px] font-medium tracking-[0.07em] text-text-tertiary mt-0.5">
                THE ART OF FLIGHT
              </div>
            </div>
          </Link>
          <Link
            href="/"
            className="px-3 py-1.5 rounded-md text-sm font-semibold bg-accent text-text-on-accent hover:bg-accent-hover transition-colors whitespace-nowrap flex-shrink-0"
          >
            Prijavi se
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 lg:py-8 space-y-6">
        <div className="bg-bg-surface border border-accent/15 rounded-xl overflow-hidden">
          <div className="h-28 lg:h-40 bg-gradient-to-br from-accent/30 to-accent/70" />
          <div className="px-6 pb-6">
            <div className="-mt-12 lg:-mt-16 mb-3">
              <Avatar
                src={profile.avatar_url}
                name={name}
                size="xl"
                className="lg:w-32 lg:h-32 lg:text-5xl border-4 border-bg-surface"
              />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-text-primary font-rajdhani">
              {name}
            </h1>
            <p className="text-text-tertiary">@{profile.username}</p>
            {profile.bio && (
              <p className="mt-4 text-text-secondary whitespace-pre-wrap break-words">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        <div className="bg-bg-surface border border-accent/15 rounded-xl p-6">
          <h2 className="text-lg font-bold text-text-primary font-rajdhani mb-4">
            Statistike
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <PublicStat
              label="Golubova"
              value={profile.stats.total_pigeons.toString()}
            />
            <PublicStat
              label="Letova"
              value={profile.stats.total_races.toString()}
            />
            <PublicStat
              label="Validnih"
              value={profile.stats.valid_races.toString()}
            />
            <PublicStat
              label="Max visina"
              value={
                profile.stats.max_altitude_ever
                  ? `${profile.stats.max_altitude_ever}m`
                  : "—"
              }
            />
          </div>
        </div>

        <div className="text-center pt-2 pb-8">
          <p className="text-sm text-text-tertiary mb-3">
            Aero Ring Tech — platforma za praćenje visinskih letova golubova
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-2 rounded-md text-sm font-semibold bg-accent text-text-on-accent hover:bg-accent-hover transition-colors"
          >
            Saznaj više
          </Link>
        </div>
      </main>
    </div>
  );
}

function PublicStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl lg:text-3xl font-bold text-text-primary font-rajdhani">
        {value}
      </div>
      <div className="text-xs text-text-tertiary uppercase tracking-wide mt-1">
        {label}
      </div>
    </div>
  );
}

import Link from "next/link";

export default function PublicProfileNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-2xl lg:text-3xl font-bold text-text-primary font-rajdhani mb-3">
        Profil nije pronađen
      </h1>
      <p className="text-text-tertiary mb-6 max-w-md">
        Profil ne postoji ili je postavljen kao privatan.
      </p>
      <Link
        href="/"
        className="px-5 py-2 rounded-md text-sm font-semibold bg-accent text-text-on-accent hover:bg-accent-hover transition-colors"
      >
        Idi na početnu
      </Link>
    </div>
  );
}

import Link from "next/link";
import { Bird } from "lucide-react";

export default function PigeonNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <Bird className="w-16 h-16 text-text-disabled mb-4" aria-hidden="true" />
      <h1 className="text-2xl font-bold text-text-primary mb-2 font-rajdhani">
        Golub nije pronađen
      </h1>
      <p className="text-text-tertiary mb-6 max-w-md">
        Golub ne postoji ili nemate pristup. Možda je obrisan ili pripada
        drugom korisniku.
      </p>
      <Link
        href="/pigeons"
        className="px-4 py-2 bg-accent text-text-on-accent rounded-md hover:bg-accent-hover transition-colors"
      >
        Nazad na Golubove
      </Link>
    </div>
  );
}

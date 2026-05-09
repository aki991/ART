import { Hammer } from "lucide-react";

interface ComingSoonProps {
  feature?: string;
}

export function ComingSoon({ feature }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-6">
        <Hammer size={28} className="text-gray-400" strokeWidth={1.5} />
      </div>
      <h2 className="text-lg font-semibold text-gray-700 mb-2 font-rajdhani">
        U izradi
      </h2>
      <p className="text-gray-400 text-sm max-w-xs">
        {feature
          ? `Funkcionalnost "${feature}" je u razvoju.`
          : "Ova sekcija je u razvoju."}
      </p>
    </div>
  );
}

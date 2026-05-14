import { cn } from "@/lib/utils";

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: AvatarSize;
  className?: string;
}

const SIZES: Record<AvatarSize, string> = {
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-16 h-16 text-2xl",
  xl: "w-24 h-24 text-4xl",
};

function initial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed[0].toUpperCase() : "?";
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border",
        src
          ? "border-white/10"
          : "bg-cyan-brand/20 border-cyan-brand/40 text-cyan-brand font-semibold font-rajdhani",
        SIZES[size],
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          draggable={false}
        />
      ) : (
        initial(name)
      )}
    </div>
  );
}

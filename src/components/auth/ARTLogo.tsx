"use client";

interface ARTLogoProps {
  size?: number;
  intensity?: number;
  className?: string;
}

export default function ARTLogo({ size, intensity = 1, className = "" }: ARTLogoProps) {
  const glow = intensity;
  const sizeStyle = size ? { width: size, height: size } : undefined;
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={sizeStyle}
    >
      <img
        src="/art-logo.png"
        alt="Aero Ring Tech"
        className="w-full h-full"
        style={{
          objectFit: "contain",
          filter: `drop-shadow(0 0 ${24 * glow}px rgba(0, 210, 255, ${0.55 * glow})) drop-shadow(0 0 ${60 * glow}px rgba(0, 210, 255, ${0.3 * glow})) drop-shadow(0 0 ${100 * glow}px rgba(0, 210, 255, ${0.15 * glow}))`,
        }}
      />
    </div>
  );
}

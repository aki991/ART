"use client";

interface ARTLogoProps {
  size?: number;
  intensity?: number;
}

export default function ARTLogo({ size = 240, intensity = 1 }: ARTLogoProps) {
  const glow = intensity;
  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src="/art-logo.png"
        alt="Aero Ring Tech"
        style={{
          objectFit: "contain",
          filter: `drop-shadow(0 0 ${24 * glow}px rgba(0, 210, 255, ${0.55 * glow})) drop-shadow(0 0 ${60 * glow}px rgba(0, 210, 255, ${0.3 * glow})) drop-shadow(0 0 ${100 * glow}px rgba(0, 210, 255, ${0.15 * glow}))`,
          width: "500px",
          height: "500px",
        }}
      />
    </div>
  );
}

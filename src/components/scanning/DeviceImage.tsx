export function DeviceImage() {
  return (
    <div className="flex justify-center">
      <img
        src="/devices/base-station.png"
        alt="Bazni uredjaj — Aero Ring Tech prijemnik"
        draggable={false}
        className="max-w-[220px] max-h-[220px] lg:max-w-[600px] lg:max-h-[600px] w-full object-contain"
        style={{
          filter:
            "drop-shadow(0 0 30px rgba(0,210,255,0.15)) drop-shadow(0 0 60px rgba(0,210,255,0.08))",
        }}
      />
    </div>
  );
}

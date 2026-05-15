import ARTLogo from "./ARTLogo";

export default function BrandingPanel() {
  return (
    <div className="branding-panel">
      <div className="brand-center">
        <div className="logo-wrap">
          <ARTLogo size={400} />
        </div>
        <div className="flex flex-col items-center">
          <span className="font-rajdhani font-bold text-3xl tracking-[0.2em] leading-none whitespace-nowrap text-gradient-logo">
            AERO RING TECH
          </span>
          <span className="mt-1.5 font-rajdhani font-medium text-sm tracking-[0.1em] leading-none text-text-tertiary">
            THE ART OF FLIGHT
          </span>
        </div>
      </div>
    </div>
  );
}

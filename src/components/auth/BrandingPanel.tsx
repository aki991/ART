import ARTLogo from "./ARTLogo";

export default function BrandingPanel() {
  return (
    <div className="branding-panel">
      <div className="brand-center">
        <div className="logo-wrap">
          <ARTLogo className="w-[60px] h-[60px] lg:w-[400px] lg:h-[400px]" />
        </div>
        <div className="brand-text">
          <span className="brand-title font-rajdhani font-bold tracking-[0.15em] lg:tracking-[0.2em] leading-none whitespace-nowrap text-gradient-logo">
            AERO RING TECH
          </span>
          <span className="brand-slogan font-rajdhani font-medium tracking-[0.1em] leading-none text-text-tertiary">
            THE ART OF FLIGHT
          </span>
        </div>
      </div>
    </div>
  );
}

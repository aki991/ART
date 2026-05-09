// Left branding panel — MINIMAL: just logo, name, tagline

const BrandingPanel = () => {
  return (
    <div className="branding-panel">
      <div className="brand-center">
        <div className="logo-wrap">
          <ARTLogo size={260} />
        </div>
        <div className="brand-name">
          <span className="brand-word brand-word-aero">AERO</span>
          <span className="brand-divider" />
          <span className="brand-word brand-word-ring">RING</span>
          <span className="brand-divider" />
          <span className="brand-word brand-word-tech">TECH</span>
        </div>
        <div className="brand-tagline">THE ART OF FLIGHT</div>
      </div>
    </div>
  );
};

window.BrandingPanel = BrandingPanel;

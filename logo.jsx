// Aero Ring Tech logo — uses real PNG asset with cyan glow
const ARTLogo = ({ size = 240, intensity = 1 }) => {
  const glow = intensity;
  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
      
      <img
        src="assets/art-logo.png"
        alt="Aero Ring Tech"
        style={{


          objectFit: 'contain',
          filter: `drop-shadow(0 0 ${24 * glow}px rgba(0, 210, 255, ${0.55 * glow})) drop-shadow(0 0 ${60 * glow}px rgba(0, 210, 255, ${0.3 * glow})) drop-shadow(0 0 ${100 * glow}px rgba(0, 210, 255, ${0.15 * glow}))`, width: "500px", height: "500px"
        }} />
      
    </div>);

};

// Keep the old SVG export available but unused
const ARTLogoSVG = ({ size = 240, intensity = 1 }) => {
  const s = size;
  const glow = intensity;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: `drop-shadow(0 0 ${24 * glow}px rgba(0, 210, 255, ${0.55 * glow})) drop-shadow(0 0 ${60 * glow}px rgba(0, 210, 255, ${0.25 * glow}))` }}>
      
      <defs>
        <radialGradient id="ringGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0A2540" />
          <stop offset="60%" stopColor="#051320" />
          <stop offset="100%" stopColor="#01060D" />
        </radialGradient>
        <linearGradient id="cyanEdge" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D2FF" />
          <stop offset="50%" stopColor="#7BE5FF" />
          <stop offset="100%" stopColor="#00D2FF" />
        </linearGradient>
        <linearGradient id="copperEdge" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C79F64" />
          <stop offset="50%" stopColor="#E5C28A" />
          <stop offset="100%" stopColor="#8A6A3C" />
        </linearGradient>
        <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00D2FF" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#00D2FF" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#00D2FF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer halo */}
      <circle cx="120" cy="120" r="118" fill="url(#coreGlow)" opacity="0.4" />

      {/* Outer ring */}
      <circle cx="120" cy="120" r="108" stroke="url(#cyanEdge)" strokeWidth="1.5" opacity="0.6" />
      <circle cx="120" cy="120" r="104" stroke="url(#cyanEdge)" strokeWidth="0.5" opacity="0.35" />

      {/* Tick marks around outer ring */}
      {Array.from({ length: 36 }).map((_, i) => {
        const angle = i * 360 / 36;
        const long = i % 9 === 0;
        const r1 = long ? 96 : 100;
        const r2 = 108;
        const x1 = 120 + Math.cos(angle * Math.PI / 180) * r1;
        const y1 = 120 + Math.sin(angle * Math.PI / 180) * r1;
        const x2 = 120 + Math.cos(angle * Math.PI / 180) * r2;
        const y2 = 120 + Math.sin(angle * Math.PI / 180) * r2;
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#00D2FF" strokeWidth={long ? 1.2 : 0.6} opacity={long ? 0.7 : 0.35} />);

      })}

      {/* Main ring body */}
      <circle cx="120" cy="120" r="86" fill="url(#ringGrad)" stroke="url(#cyanEdge)" strokeWidth="2" />
      <circle cx="120" cy="120" r="86" stroke="#00D2FF" strokeWidth="0.5" opacity="0.6" />

      {/* Inner ring with copper */}
      <circle cx="120" cy="120" r="72" stroke="url(#copperEdge)" strokeWidth="1.2" opacity="0.85" />
      <circle cx="120" cy="120" r="64" stroke="#00D2FF" strokeWidth="0.5" opacity="0.4" />

      {/* Sensor dots on the ring (like the rings in image) */}
      {[0, 60, 120, 180, 240, 300].map((a, i) => {
        const x = 120 + Math.cos(a * Math.PI / 180) * 79;
        const y = 120 + Math.sin(a * Math.PI / 180) * 79;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="2.4" fill="#00D2FF" />
            <circle cx={x} cy={y} r="5" fill="#00D2FF" opacity="0.25" />
          </g>);

      })}

      {/* Inner core */}
      <circle cx="120" cy="120" r="48" fill="url(#coreGlow)" opacity="0.6" />

      {/* Feather glyph — stylized */}
      <g transform="translate(120 120)" opacity="0.95">
        {/* Spine */}
        <path d="M 0 -42 Q -2 -10, -3 22 L -3 38 L 0 42 L 3 38 L 3 22 Q 2 -10, 0 -42 Z"
        fill="url(#copperEdge)" stroke="#E5C28A" strokeWidth="0.4" />
        {/* Barbs left */}
        {[-32, -22, -12, -2, 8, 18].map((y, i) => {
          const w = 22 - Math.abs(y + 12) * 0.4;
          return (
            <path key={`l${i}`} d={`M -2 ${y} Q ${-w * 0.6} ${y + 4}, ${-w} ${y + 8}`}
            stroke="#00D2FF" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity={0.85 - i * 0.05} />);

        })}
        {/* Barbs right */}
        {[-32, -22, -12, -2, 8, 18].map((y, i) => {
          const w = 22 - Math.abs(y + 12) * 0.4;
          return (
            <path key={`r${i}`} d={`M 2 ${y} Q ${w * 0.6} ${y + 4}, ${w} ${y + 8}`}
            stroke="#7BE5FF" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity={0.85 - i * 0.05} />);

        })}
        {/* Tip glow */}
        <circle cx="0" cy="-42" r="2.5" fill="#00D2FF" />
        <circle cx="0" cy="-42" r="6" fill="#00D2FF" opacity="0.4" />
      </g>

      {/* Outer rotating ticks (decorative) */}
      <g opacity="0.6">
        <circle cx="120" cy="12" r="2" fill="#C79F64" />
        <circle cx="228" cy="120" r="2" fill="#00D2FF" />
        <circle cx="120" cy="228" r="2" fill="#C79F64" />
        <circle cx="12" cy="120" r="2" fill="#00D2FF" />
      </g>
    </svg>);

};

window.ARTLogo = ARTLogo;
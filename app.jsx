// Main app — minimal layout with language selector

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "primaryGlow": "#00D2FF",
  "copperAccent": "#C79F64",
  "brandBg": "#01060D",
  "formBg": "#FFFFFF"
}/*EDITMODE-END*/;

const LANGS = [
  { code: 'sr', label: 'Srpski', flag: '🇷🇸' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

const LanguageSelector = ({ value, onChange }) => (
  <div className="lang-selector">
    {LANGS.map(l => (
      <button
        key={l.code}
        type="button"
        className={`lang-flag ${value === l.code ? 'active' : ''}`}
        onClick={() => onChange(l.code)}
        title={l.label}
        aria-label={l.label}
      >
        <span className="lang-flag-emoji">{l.flag}</span>
      </button>
    ))}
  </div>
);

const App = () => {
  const [mode, setMode] = React.useState('login');
  const [lang, setLang] = React.useState('sr');
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--cyan', tweaks.primaryGlow);
    root.style.setProperty('--copper', tweaks.copperAccent);
    root.style.setProperty('--brand-bg', tweaks.brandBg);
  }, [tweaks.primaryGlow, tweaks.copperAccent, tweaks.brandBg]);

  return (
    <div className="auth-page minimal">
      <main className="auth-main">
        <section className="auth-left">
          <BrandingPanel />
        </section>
        <section className="auth-right">
          <FormPanel mode={mode} setMode={setMode} lang={lang} />
          <div className="lang-bar">
            <LanguageSelector value={lang} onChange={setLang} />
          </div>
        </section>
      </main>

      <TweaksPanel title="Tweaks" subtitle="Aero Ring Tech">
        <TweakSection title="Boje">
          <TweakColor label="Primarni sjaj" value={tweaks.primaryGlow} onChange={v => setTweak('primaryGlow', v)} />
          <TweakColor label="Bakarni akcent" value={tweaks.copperAccent} onChange={v => setTweak('copperAccent', v)} />
          <TweakColor label="Pozadina brenda" value={tweaks.brandBg} onChange={v => setTweak('brandBg', v)} />
        </TweakSection>
        <TweakSection title="Mod">
          <TweakButton onClick={() => setMode(m => m === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Prikaži registraciju →' : 'Prikaži prijavu →'}
          </TweakButton>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

// Right form panel — modern with icons, no floating labels

const Icon = ({ name, size = 18 }) => {
  const stroke = "currentColor";
  const sw = 1.6;
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case 'club':
      return (<svg {...common}><path d="M3 21V8l9-5 9 5v13" /><path d="M9 21v-7h6v7" /></svg>);
    case 'mail':
      return (<svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>);
    case 'lock':
      return (<svg {...common}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>);
    case 'user':
      return (<svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" /></svg>);
    case 'id':
      return (<svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="2.2" /><path d="M5.5 17c.6-1.6 2-2.4 3.5-2.4s2.9.8 3.5 2.4" /><path d="M14 9h5M14 12h4M14 15h3" /></svg>);
    case 'eye':
      return (<svg {...common}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>);
    case 'eye-off':
      return (<svg {...common}><path d="M3 3l18 18" /><path d="M10.6 6.1A10 10 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.1 3.7" /><path d="M6.6 6.6A17 17 0 0 0 2 12s3.5 6 10 6c1.6 0 3-.3 4.2-.8" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>);
    case 'check':
      return (<svg {...common}><path d="M5 12l4 4 10-10" /></svg>);
    case 'arrow':
      return (<svg {...common}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
    default:
      return null;
  }
};

const TextField = ({ placeholder, name, type = 'text', icon, value, onChange, autoComplete, required }) => {
  const [focused, setFocused] = React.useState(false);
  const [show, setShow] = React.useState(false);
  const isPass = type === 'password';
  const realType = isPass && show ? 'text' : type;

  return (
    <div className={`mfield ${focused ? 'is-focus' : ''} ${value ? 'is-filled' : ''}`}>
      <div className="mfield-wrap">
        <span className="mfield-icon"><Icon name={icon} size={18} /></span>
        <input
          id={name}
          name={name}
          type={realType}
          value={value}
          onChange={onChange}
          placeholder={placeholder + (required ? ' *' : '')}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {isPass && (
          <button type="button" className="mfield-eye" onClick={() => setShow(s => !s)} tabIndex={-1} aria-label="prikaži lozinku">
            <Icon name={show ? 'eye-off' : 'eye'} size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

const SelectField = ({ placeholder, name, icon, value, onChange, options, required }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const choose = (v) => {
    onChange({ target: { value: v } });
    setOpen(false);
  };

  return (
    <div ref={ref} className={`mfield mselect ${open ? 'is-focus is-open' : ''} ${value ? 'is-filled' : ''}`}>
      <button
        type="button"
        className="mfield-wrap mselect-trigger"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        id={name}
      >
        <span className="mfield-icon"><Icon name={icon} size={18} /></span>
        <span className={`mselect-value ${value ? '' : 'is-placeholder'}`}>
          {value || (placeholder + (required ? ' *' : ''))}
        </span>
        <span className="mfield-chevron">▾</span>
      </button>
      {open && (
        <ul className="mselect-menu" role="listbox">
          {options.map(o => (
            <li
              key={o}
              role="option"
              aria-selected={value === o}
              className={`mselect-option ${value === o ? 'is-active' : ''}`}
              onClick={() => choose(o)}
            >
              {o}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Checkbox = ({ checked, onChange, children }) => (
  <label className="mcheckbox">
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span className="mcheck-box">
      <span className="mcheck-mark"><Icon name="check" size={11} /></span>
    </span>
    <span className="mcheck-label">{children}</span>
  </label>
);

const KLUBOVI = ['PRG Beograd', 'SK Novi Sad', 'Krila Niša', 'Aero Subotica', 'Visoko Krilo Kragujevac', 'Drugi klub…'];

const T = {
  sr: {
    loginTitle: 'Prijava', registerTitle: 'Registracija',
    loginSub: 'Pristup vašem nalogu', registerSub: 'Otvorite novi nalog',
    klub: 'Klub', ime: 'Ime', prezime: 'Prezime',
    email: 'Korisničko ime ili imejl', emailReg: 'Imejl adresa',
    password: 'Lozinka',
    remember: 'Zapamti me',
    forgot: 'Zaboravljena lozinka?',
    loginBtn: 'Prijavi se', registerBtn: 'Registruj se',
    noAccount: 'Nemaš nalog?', haveAccount: 'Već imaš nalog?',
    register: 'Registruj se', login: 'Prijavi se',
  },
  en: {
    loginTitle: 'Sign in', registerTitle: 'Sign up',
    loginSub: 'Access your account', registerSub: 'Create a new account',
    klub: 'Club', ime: 'First name', prezime: 'Last name',
    email: 'Username or email', emailReg: 'Email address',
    password: 'Password',
    remember: 'Remember me',
    forgot: 'Forgot password?',
    loginBtn: 'Sign in', registerBtn: 'Sign up',
    noAccount: "Don't have an account?", haveAccount: 'Already have an account?',
    register: 'Sign up', login: 'Sign in',
  },
  de: {
    loginTitle: 'Anmelden', registerTitle: 'Registrieren',
    loginSub: 'Zugang zu Ihrem Konto', registerSub: 'Neues Konto erstellen',
    klub: 'Verein', ime: 'Vorname', prezime: 'Nachname',
    email: 'Benutzername oder E-Mail', emailReg: 'E-Mail-Adresse',
    password: 'Passwort',
    remember: 'Angemeldet bleiben',
    forgot: 'Passwort vergessen?',
    loginBtn: 'Anmelden', registerBtn: 'Registrieren',
    noAccount: 'Noch kein Konto?', haveAccount: 'Bereits ein Konto?',
    register: 'Registrieren', login: 'Anmelden',
  },
};

const LoginForm = ({ onSwitch, t }) => {
  const [data, setData] = React.useState({ klub: '', email: '', password: '' });
  const [remember, setRemember] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const set = (k) => (e) => setData(d => ({ ...d, [k]: e.target.value }));

  const submit = (e) => {
    e?.preventDefault?.();
    setLoading(true);
    setTimeout(() => setLoading(false), 1400);
  };

  return (
    <form className="mform" onSubmit={submit}>
      <SelectField placeholder={t.klub} icon="club" name="klub-login" value={data.klub} onChange={set('klub')} options={KLUBOVI} />
      <TextField placeholder={t.email} icon="mail" name="email-login" type="text" value={data.email} onChange={set('email')} autoComplete="email" required />
      <TextField placeholder={t.password} icon="lock" name="pass-login" type="password" value={data.password} onChange={set('password')} autoComplete="current-password" required />

      <div className="mform-row">
        <Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)}>{t.remember}</Checkbox>
        <a href="#" className="mlink-cyan">{t.forgot}</a>
      </div>

      <button type="submit" className={`mbtn ${loading ? 'is-loading' : ''}`} disabled={loading}>
        <span className="mbtn-shine" />
        <span className="mbtn-content">
          {loading ? <span className="mbtn-spinner" /> : (
            <>
              <span>{t.loginBtn}</span>
              <span className="mbtn-arrow"><Icon name="arrow" size={16} /></span>
            </>
          )}
        </span>
      </button>

      <div className="mform-bottom">
        <span>{t.noAccount}</span>{' '}
        <button type="button" className="mlink-cyan" onClick={onSwitch}>{t.register}</button>
      </div>
    </form>
  );
};

const RegisterForm = ({ onSwitch, t }) => {
  const [data, setData] = React.useState({ klub: '', ime: '', prezime: '', email: '', password: '' });
  const [loading, setLoading] = React.useState(false);
  const set = (k) => (e) => setData(d => ({ ...d, [k]: e.target.value }));

  const submit = (e) => {
    e?.preventDefault?.();
    setLoading(true);
    setTimeout(() => setLoading(false), 1400);
  };

  return (
    <form className="mform" onSubmit={submit}>
      <SelectField placeholder={t.klub} icon="club" name="klub-reg" value={data.klub} onChange={set('klub')} options={KLUBOVI} required />
      <TextField placeholder={t.ime} icon="user" name="ime" value={data.ime} onChange={set('ime')} autoComplete="given-name" required />
      <TextField placeholder={t.prezime} icon="id" name="prezime" value={data.prezime} onChange={set('prezime')} autoComplete="family-name" required />
      <TextField placeholder={t.emailReg} icon="mail" name="email-reg" type="email" value={data.email} onChange={set('email')} autoComplete="email" required />
      <TextField placeholder={t.password} icon="lock" name="pass-reg" type="password" value={data.password} onChange={set('password')} autoComplete="new-password" required />

      <button type="submit" className={`mbtn ${loading ? 'is-loading' : ''}`} disabled={loading}>
        <span className="mbtn-shine" />
        <span className="mbtn-content">
          {loading ? <span className="mbtn-spinner" /> : (
            <>
              <span>{t.registerBtn}</span>
              <span className="mbtn-arrow"><Icon name="arrow" size={16} /></span>
            </>
          )}
        </span>
      </button>

      <div className="mform-bottom">
        <span>{t.haveAccount}</span>{' '}
        <button type="button" className="mlink-cyan" onClick={onSwitch}>{t.login}</button>
      </div>
    </form>
  );
};

const FormPanel = ({ mode, setMode, lang }) => {
  const t = T[lang] || T.sr;
  return (
    <div className="form-panel-outer">
      <div className="form-panel">
        <h1 className="mform-title">{mode === 'login' ? t.loginTitle : t.registerTitle}</h1>
        <p className="mform-sub">{mode === 'login' ? (t.loginSub || 'Pristup vašem nalogu') : (t.registerSub || 'Otvorite novi nalog')}</p>
        <div className="form-body">
          {mode === 'login'
            ? <LoginForm onSwitch={() => setMode('register')} t={t} />
            : <RegisterForm onSwitch={() => setMode('login')} t={t} />}
        </div>
      </div>
    </div>
  );
};

window.FormPanel = FormPanel;
window.LANG_DICT = T;

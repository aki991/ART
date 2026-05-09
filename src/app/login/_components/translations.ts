export type Lang = "sr" | "en" | "de";

export type TranslationKey =
  | "loginTitle"
  | "registerTitle"
  | "loginSub"
  | "registerSub"
  | "klub"
  | "ime"
  | "prezime"
  | "email"
  | "emailReg"
  | "password"
  | "remember"
  | "forgot"
  | "loginBtn"
  | "registerBtn"
  | "noAccount"
  | "haveAccount"
  | "register"
  | "login"
  | "skipLogin";

export const translations: Record<Lang, Record<TranslationKey, string>> = {
  sr: {
    loginTitle: "Prijava",
    registerTitle: "Registracija",
    loginSub: "Pristup vašem nalogu",
    registerSub: "Otvorite novi nalog",
    klub: "Klub",
    ime: "Ime",
    prezime: "Prezime",
    email: "Korisničko ime ili imejl",
    emailReg: "Imejl adresa",
    password: "Lozinka",
    remember: "Zapamti me",
    forgot: "Zaboravljena lozinka?",
    loginBtn: "Prijavi se",
    registerBtn: "Registruj se",
    noAccount: "Nemaš nalog?",
    haveAccount: "Već imaš nalog?",
    register: "Registruj se",
    login: "Prijavi se",
    skipLogin: "Preskoči login (DEV)",
  },
  en: {
    loginTitle: "Sign in",
    registerTitle: "Sign up",
    loginSub: "Access your account",
    registerSub: "Create a new account",
    klub: "Club",
    ime: "First name",
    prezime: "Last name",
    email: "Username or email",
    emailReg: "Email address",
    password: "Password",
    remember: "Remember me",
    forgot: "Forgot password?",
    loginBtn: "Sign in",
    registerBtn: "Sign up",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    register: "Sign up",
    login: "Sign in",
    skipLogin: "Skip login (DEV)",
  },
  de: {
    loginTitle: "Anmelden",
    registerTitle: "Registrieren",
    loginSub: "Zugang zu Ihrem Konto",
    registerSub: "Neues Konto erstellen",
    klub: "Verein",
    ime: "Vorname",
    prezime: "Nachname",
    email: "Benutzername oder E-Mail",
    emailReg: "E-Mail-Adresse",
    password: "Passwort",
    remember: "Angemeldet bleiben",
    forgot: "Passwort vergessen?",
    loginBtn: "Anmelden",
    registerBtn: "Registrieren",
    noAccount: "Noch kein Konto?",
    haveAccount: "Bereits ein Konto?",
    register: "Registrieren",
    login: "Anmelden",
    skipLogin: "Login überspringen (DEV)",
  },
};

export const DEFAULT_LANG: Lang = "sr";

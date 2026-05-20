export type Lang = "sr" | "en" | "de";

export type TranslationKey =
  | "loginTitle"
  | "registerTitle"
  | "loginSub"
  | "registerSub"
  | "klub"
  | "ime"
  | "prezime"
  | "username"
  | "email"
  | "emailReg"
  | "password"
  | "confirmPassword"
  | "remember"
  | "forgot"
  | "loginBtn"
  | "registerBtn"
  | "noAccount"
  | "haveAccount"
  | "register"
  | "login"
  | "skipLogin"
  | "errorRequired"
  | "errorEmailFormat"
  | "errorPasswordMin"
  | "errorPasswordMatch"
  | "errorUsernameTaken"
  | "errorUsernameInvalid"
  | "errorInvalidLogin"
  | "errorGeneric"
  | "forgotModalTitle"
  | "forgotModalBody"
  | "forgotModalClose";

export const translations: Record<Lang, Record<TranslationKey, string>> = {
  sr: {
    loginTitle: "Prijava",
    registerTitle: "Registracija",
    loginSub: "Pristup vašem nalogu",
    registerSub: "Otvorite novi nalog",
    klub: "Društvo",
    ime: "Ime",
    prezime: "Prezime",
    username: "Korisničko ime",
    email: "Korisničko ime ili imejl",
    emailReg: "Imejl adresa",
    password: "Lozinka",
    confirmPassword: "Potvrdi lozinku",
    remember: "Zapamti me",
    forgot: "Zaboravljena lozinka?",
    loginBtn: "Prijavi se",
    registerBtn: "Registruj se",
    noAccount: "Nemaš nalog?",
    haveAccount: "Već imaš nalog?",
    register: "Registruj se",
    login: "Prijavi se",
    skipLogin: "Preskoči login (DEV)",
    errorRequired: "Obavezno polje.",
    errorEmailFormat: "Unesite ispravnu email adresu.",
    errorPasswordMin: "Lozinka mora imati najmanje 8 karaktera.",
    errorPasswordMatch: "Lozinke se ne poklapaju.",
    errorUsernameTaken: "Korisničko ime je već zauzeto.",
    errorUsernameInvalid:
      "Korisničko ime: dozvoljena su samo slova a–z (bez š, č, ć, ž, đ), brojevi i _, najmanje 3 znaka.",
    errorInvalidLogin: "Pogrešno korisničko ime/email ili lozinka.",
    errorGeneric: "Došlo je do greške. Pokušajte ponovo.",
    forgotModalTitle: "Zaboravljena lozinka",
    forgotModalBody: "Funkcionalnost dolazi uskoro.",
    forgotModalClose: "Zatvori",
  },
  en: {
    loginTitle: "Sign in",
    registerTitle: "Sign up",
    loginSub: "Access your account",
    registerSub: "Create a new account",
    klub: "Club",
    ime: "First name",
    prezime: "Last name",
    username: "Username",
    email: "Username or email",
    emailReg: "Email address",
    password: "Password",
    confirmPassword: "Confirm password",
    remember: "Remember me",
    forgot: "Forgot password?",
    loginBtn: "Sign in",
    registerBtn: "Sign up",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    register: "Sign up",
    login: "Sign in",
    skipLogin: "Skip login (DEV)",
    errorRequired: "This field is required.",
    errorEmailFormat: "Enter a valid email address.",
    errorPasswordMin: "Password must be at least 8 characters.",
    errorPasswordMatch: "Passwords do not match.",
    errorUsernameTaken: "Username is already taken.",
    errorUsernameInvalid:
      "Username may contain only letters a–z, numbers and _, and must be at least 3 characters.",
    errorInvalidLogin: "Invalid username/email or password.",
    errorGeneric: "Something went wrong. Please try again.",
    forgotModalTitle: "Forgot password",
    forgotModalBody: "This feature is coming soon.",
    forgotModalClose: "Close",
  },
  de: {
    loginTitle: "Anmelden",
    registerTitle: "Registrieren",
    loginSub: "Zugang zu Ihrem Konto",
    registerSub: "Neues Konto erstellen",
    klub: "Verein",
    ime: "Vorname",
    prezime: "Nachname",
    username: "Benutzername",
    email: "Benutzername oder E-Mail",
    emailReg: "E-Mail-Adresse",
    password: "Passwort",
    confirmPassword: "Passwort bestätigen",
    remember: "Angemeldet bleiben",
    forgot: "Passwort vergessen?",
    loginBtn: "Anmelden",
    registerBtn: "Registrieren",
    noAccount: "Noch kein Konto?",
    haveAccount: "Bereits ein Konto?",
    register: "Registrieren",
    login: "Anmelden",
    skipLogin: "Login überspringen (DEV)",
    errorRequired: "Pflichtfeld.",
    errorEmailFormat: "Bitte eine gültige E-Mail-Adresse eingeben.",
    errorPasswordMin: "Das Passwort muss mindestens 8 Zeichen lang sein.",
    errorPasswordMatch: "Passwörter stimmen nicht überein.",
    errorUsernameTaken: "Benutzername ist bereits vergeben.",
    errorUsernameInvalid:
      "Der Benutzername darf nur Buchstaben a–z, Zahlen und _ enthalten und muss mindestens 3 Zeichen lang sein.",
    errorInvalidLogin: "Falscher Benutzername/E-Mail oder Passwort.",
    errorGeneric: "Etwas ist schief gelaufen. Bitte erneut versuchen.",
    forgotModalTitle: "Passwort vergessen",
    forgotModalBody: "Diese Funktion kommt bald.",
    forgotModalClose: "Schließen",
  },
};

export const DEFAULT_LANG: Lang = "sr";

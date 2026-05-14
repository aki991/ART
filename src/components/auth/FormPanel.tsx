"use client";

import type { AuthMode } from "./AuthApp";
import type { Lang } from "./translations";
import { translations } from "./translations";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

interface FormPanelProps {
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
  lang: Lang;
}

export default function FormPanel({ mode, setMode, lang }: FormPanelProps) {
  const t = translations[lang] ?? translations.sr;
  return (
    <div className="form-panel-outer">
      <div className="form-panel">
        <h1 className="mform-title">
          {mode === "login" ? t.loginTitle : t.registerTitle}
        </h1>
        <p className="mform-sub">
          {mode === "login" ? t.loginSub : t.registerSub}
        </p>
        <div className="form-body">
          {mode === "login" ? (
            <LoginForm onSwitch={() => setMode("register")} t={t} />
          ) : (
            <RegisterForm onSwitch={() => setMode("login")} t={t} />
          )}
        </div>
      </div>
    </div>
  );
}

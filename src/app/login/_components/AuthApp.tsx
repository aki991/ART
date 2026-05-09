"use client";

import { useState } from "react";
import BrandingPanel from "./BrandingPanel";
import FormPanel from "./FormPanel";
import LanguageSelector from "./LanguageSelector";
import type { Lang } from "./translations";

export type AuthMode = "login" | "register";

export default function AuthApp() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [lang, setLang] = useState<Lang>("sr");

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
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import BrandingPanel from "./BrandingPanel";
import FormPanel from "./FormPanel";
import LanguageSelector from "./LanguageSelector";
import type { Lang } from "./translations";

export type AuthMode = "login" | "register";

export default function AuthApp() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [lang, setLang] = useState<Lang>("sr");

  useEffect(() => setMounted(true), []);

  // An already-authenticated visitor has no business on the login screen.
  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [mounted, isAuthenticated, router]);

  if (mounted && isAuthenticated) return null;

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

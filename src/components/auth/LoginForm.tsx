"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import TextField from "./TextField";
import SelectField from "./SelectField";
import Checkbox from "./Checkbox";
import type { TranslationKey } from "./translations";

const KLUBOVI = [
  "PRG Beograd",
  "SK Novi Sad",
  "Krila Niša",
  "Aero Subotica",
  "Visoko Krilo Kragujevac",
  "Drugi klub…",
];

interface LoginFormProps {
  onSwitch: () => void;
  t: Record<TranslationKey, string>;
}

export default function LoginForm({ onSwitch, t }: LoginFormProps) {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [data, setData] = useState({ klub: "", email: "", password: "" });
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof data) => (e: { target: { value: string } }) =>
    setData((d) => ({ ...d, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    login();
    router.push("/dashboard");
  };

  // DEV shortcut — flips the auth flag without real credentials.
  const skipLogin = () => {
    login();
    router.push("/dashboard");
  };

  return (
    <form className="mform" onSubmit={submit}>
      <SelectField
        placeholder={t.klub}
        name="klub-login"
        value={data.klub}
        onChange={set("klub")}
        options={KLUBOVI}
      />
      <TextField
        placeholder={t.email}
        icon="mail"
        name="email-login"
        type="text"
        value={data.email}
        onChange={set("email") as React.ChangeEventHandler<HTMLInputElement>}
        autoComplete="email"
        required
      />
      <TextField
        placeholder={t.password}
        icon="lock"
        name="pass-login"
        type="password"
        value={data.password}
        onChange={set("password") as React.ChangeEventHandler<HTMLInputElement>}
        autoComplete="current-password"
        required
      />

      <div className="mform-row">
        <Checkbox
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
        >
          {t.remember}
        </Checkbox>
        <a href="#" className="mlink-cyan">
          {t.forgot}
        </a>
      </div>

      <button
        type="submit"
        className={`mbtn ${loading ? "is-loading" : ""}`}
        disabled={loading}
      >
        <span className="mbtn-shine" />
        <span className="mbtn-content">
          {loading ? (
            <span className="mbtn-spinner" />
          ) : (
            <>
              <span>{t.loginBtn}</span>
              <span className="mbtn-arrow">
                <ArrowRight size={16} strokeWidth={1.6} />
              </span>
            </>
          )}
        </span>
      </button>

      <div className="mform-bottom">
        <span>{t.noAccount}</span>{" "}
        <button type="button" className="mlink-cyan" onClick={onSwitch}>
          {t.register}
        </button>
      </div>

      {/* TODO(auth): Ukloniti pre produkcije */}
      <button
        type="button"
        data-dev-only="true"
        onClick={skipLogin}
        aria-label="Privremeno preskakanje login-a — dev only"
        className="block w-full text-center mt-3 text-xs text-white/40 hover:text-cyan-brand transition-colors rounded focus:outline-none focus:ring-2 focus:ring-cyan-brand"
      >
        ↪ {t.skipLogin}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import TextField from "./TextField";
import SelectField from "./SelectField";
import type { TranslationKey } from "./translations";

const KLUBOVI = [
  "PRG Beograd",
  "SK Novi Sad",
  "Krila Niša",
  "Aero Subotica",
  "Visoko Krilo Kragujevac",
  "Drugi klub…",
];

interface RegisterFormProps {
  onSwitch: () => void;
  t: Record<TranslationKey, string>;
}

export default function RegisterForm({ onSwitch, t }: RegisterFormProps) {
  const [data, setData] = useState({
    klub: "",
    ime: "",
    prezime: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof data) => (e: { target: { value: string } }) =>
    setData((d) => ({ ...d, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <form className="mform" onSubmit={submit}>
      <SelectField
        placeholder={t.klub}
        name="klub-reg"
        value={data.klub}
        onChange={set("klub")}
        options={KLUBOVI}
        required
      />
      <TextField
        placeholder={t.ime}
        icon="user"
        name="ime"
        value={data.ime}
        onChange={set("ime") as React.ChangeEventHandler<HTMLInputElement>}
        autoComplete="given-name"
        required
      />
      <TextField
        placeholder={t.prezime}
        icon="id"
        name="prezime"
        value={data.prezime}
        onChange={set("prezime") as React.ChangeEventHandler<HTMLInputElement>}
        autoComplete="family-name"
        required
      />
      <TextField
        placeholder={t.emailReg}
        icon="mail"
        name="email-reg"
        type="email"
        value={data.email}
        onChange={set("email") as React.ChangeEventHandler<HTMLInputElement>}
        autoComplete="email"
        required
      />
      <TextField
        placeholder={t.password}
        icon="lock"
        name="pass-reg"
        type="password"
        value={data.password}
        onChange={set("password") as React.ChangeEventHandler<HTMLInputElement>}
        autoComplete="new-password"
        required
      />

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
              <span>{t.registerBtn}</span>
              <span className="mbtn-arrow">
                <ArrowRight size={16} strokeWidth={1.6} />
              </span>
            </>
          )}
        </span>
      </button>

      <div className="mform-bottom">
        <span>{t.haveAccount}</span>{" "}
        <button type="button" className="mlink-cyan" onClick={onSwitch}>
          {t.login}
        </button>
      </div>

      {/* TODO(auth): Ukloniti pre produkcije */}
      <Link
        href="/dashboard"
        data-dev-only="true"
        aria-label="Privremeno preskakanje login-a — dev only"
        className="block text-center mt-3 text-xs text-slate-400 hover:text-cyan-brand transition-colors rounded focus:outline-none focus:ring-2 focus:ring-cyan-brand focus:ring-offset-2"
      >
        ↪ {t.skipLogin}
      </Link>
    </form>
  );
}

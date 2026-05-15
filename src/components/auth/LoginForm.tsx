"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { signInAction } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/client";
import TextField from "./TextField";
import Checkbox from "./Checkbox";
import { ForgotPasswordModal } from "./ForgotPasswordModal";
import type { TranslationKey } from "./translations";

const DEV_EMAIL = "dev@aeroringtech.local";
const DEV_PASSWORD = "dev-password-123";

interface LoginFormProps {
  onSwitch: () => void;
  t: Record<TranslationKey, string>;
}

export default function LoginForm({ onSwitch, t }: LoginFormProps) {
  const router = useRouter();
  const [data, setData] = useState({ identifier: "", password: "" });
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotOpen, setForgotOpen] = useState(false);

  const set = (k: keyof typeof data) => (e: { target: { value: string } }) =>
    setData((d) => ({ ...d, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await signInAction(data.identifier, data.password);
      if (!result.ok) {
        setError(t.errorInvalidLogin);
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError(t.errorGeneric);
      setLoading(false);
    }
  }

  // DEV shortcut — uses Supabase to sign in a fixed test user. The user must
  // exist in Supabase (create manually in Auth → Users with this email/password).
  async function skipLogin() {
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithPassword({
        email: DEV_EMAIL,
        password: DEV_PASSWORD,
      });
      if (err) {
        setError(`DEV korisnik ne postoji. Kreirajte ${DEV_EMAIL} u Supabase Auth dashboard-u.`);
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError(t.errorGeneric);
      setLoading(false);
    }
  }

  return (
    <>
      <form className="mform" onSubmit={submit}>
        <TextField
          placeholder={t.email}
          icon="user"
          name="identifier-login"
          type="text"
          value={data.identifier}
          onChange={set("identifier") as React.ChangeEventHandler<HTMLInputElement>}
          autoComplete="username"
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

        {error && (
          <div
            role="alert"
            className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2"
          >
            {error}
          </div>
        )}

        <div className="mform-row">
          <Checkbox
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          >
            {t.remember}
          </Checkbox>
          <button
            type="button"
            className="mlink-cyan"
            onClick={() => setForgotOpen(true)}
          >
            {t.forgot}
          </button>
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

        {process.env.NODE_ENV !== "production" && (
          <button
            type="button"
            data-dev-only="true"
            onClick={skipLogin}
            disabled={loading}
            aria-label="DEV login — koristi fiksnog test korisnika"
            className="block w-full text-center mt-3 text-xs text-white/40 hover:text-cyan-brand transition-colors rounded focus:outline-none focus:ring-2 focus:ring-cyan-brand"
          >
            ↪ {t.skipLogin}
          </button>
        )}
      </form>

      <ForgotPasswordModal
        isOpen={forgotOpen}
        onClose={() => setForgotOpen(false)}
        t={t}
      />
    </>
  );
}

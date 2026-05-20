"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import TextField from "./TextField";
import type { TranslationKey } from "./translations";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_]+$/;

interface RegisterFormProps {
  onSwitch: () => void;
  t: Record<TranslationKey, string>;
}

export default function RegisterForm({ onSwitch, t }: RegisterFormProps) {
  const router = useRouter();
  const [data, setData] = useState({
    ime: "",
    prezime: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof data) => (e: { target: { value: string } }) =>
    setData((d) => ({ ...d, [k]: e.target.value }));

  function validate(): string | null {
    if (
      !data.ime.trim() ||
      !data.prezime.trim() ||
      !data.username.trim() ||
      !data.email.trim() ||
      !data.password ||
      !data.confirmPassword
    ) {
      return t.errorRequired;
    }
    if (!USERNAME_RE.test(data.username.trim()) || data.username.trim().length < 3) {
      return t.errorUsernameInvalid;
    }
    if (!EMAIL_RE.test(data.email.trim())) {
      return t.errorEmailFormat;
    }
    if (data.password.length < 8) {
      return t.errorPasswordMin;
    }
    if (data.password !== data.confirmPassword) {
      return t.errorPasswordMatch;
    }
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const username = data.username.trim();

    try {
      const { data: existing } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username)
        .maybeSingle();
      if (existing) {
        setError(t.errorUsernameTaken);
        setLoading(false);
        return;
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email.trim(),
        password: data.password,
        options: {
          data: {
            username,
            first_name: data.ime.trim(),
            last_name: data.prezime.trim(),
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
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
    <form className="mform" onSubmit={submit}>
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
        placeholder={t.username}
        icon="user"
        name="username"
        value={data.username}
        onChange={set("username") as React.ChangeEventHandler<HTMLInputElement>}
        autoComplete="username"
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
      <TextField
        placeholder={t.confirmPassword}
        icon="lock"
        name="pass-confirm"
        type="password"
        value={data.confirmPassword}
        onChange={
          set("confirmPassword") as React.ChangeEventHandler<HTMLInputElement>
        }
        autoComplete="new-password"
        required
      />

      {error && (
        <div
          role="alert"
          className="text-sm text-status-error bg-bg-error-light border border-status-error/30 rounded-md px-3 py-2"
        >
          {error}
        </div>
      )}

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
    </form>
  );
}

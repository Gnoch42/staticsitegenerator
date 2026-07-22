"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/admin/actions";
import { tAdmin, type AdminLang } from "@/lib/adminI18n";

export function LoginForm({ lang }: { lang: AdminLang }) {
  const [state, formAction, pending] = useActionState(loginAction, {});
  const t = (k: string) => tAdmin(k, lang);
  return (
    <form action={formAction}>
      <label htmlFor="password">{t("login_password")}</label>
      <input
        id="password"
        name="password"
        type="password"
        autoFocus
        autoComplete="current-password"
      />
      {state?.error && <div className="error">{t("login_error")}</div>}
      <button
        type="submit"
        className="btn-primary"
        style={{ marginTop: "1rem", width: "100%" }}
        disabled={pending}
      >
        {pending ? "…" : t("login_submit")}
      </button>
    </form>
  );
}

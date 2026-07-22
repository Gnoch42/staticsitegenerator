"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/admin/actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, {});
  return (
    <form action={formAction}>
      <label htmlFor="password">Mot de passe</label>
      <input
        id="password"
        name="password"
        type="password"
        autoFocus
        autoComplete="current-password"
      />
      {state?.error && <div className="error">{state.error}</div>}
      <button
        type="submit"
        className="btn-primary"
        style={{ marginTop: "1rem", width: "100%" }}
        disabled={pending}
      >
        {pending ? "…" : "Se connecter"}
      </button>
    </form>
  );
}

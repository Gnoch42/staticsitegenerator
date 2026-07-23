"use client";

import { useState, useTransition } from "react";
import { publishAction } from "@/app/admin/actions";
import { useAdminT } from "./AdminI18n";

/** Bouton « Publier » dans la barre supérieure de l'admin. */
export function PublishButton() {
  const t = useAdminT();
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  function publish() {
    setDone(false);
    startTransition(async () => {
      try {
        await publishAction();
        setDone(true);
        setTimeout(() => setDone(false), 2500);
      } catch {
        // erreur silencieuse ; les logs serveur détaillent
      }
    });
  }

  return (
    <button className="btn-primary btn-sm" onClick={publish} disabled={pending}>
      {pending ? t("publish_running") : done ? t("saved") : t("publish_btn")}
    </button>
  );
}

"use client";

import { useState, useTransition } from "react";
import { publishAction } from "@/app/admin/actions";

export function PublishBar({ publishedAt }: { publishedAt: string | null }) {
  const [pending, startTransition] = useTransition();
  const [last, setLast] = useState(publishedAt);
  const [error, setError] = useState<string | null>(null);

  function publish() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await publishAction();
        setLast(res.publishedAt);
      } catch {
        setError("Échec de la publication. Vérifiez les logs du serveur.");
      }
    });
  }

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <div className="card-title">Publication</div>
          <div className="muted">
            {last
              ? `Dernière publication : ${new Date(last).toLocaleString("fr-CA")}`
              : "Jamais publié."}
          </div>
        </div>
        <div className="toolbar">
          <a className="btn btn-sm" href="/preview" target="_blank" rel="noreferrer">
            Aperçu
          </a>
          <button className="btn-primary" onClick={publish} disabled={pending}>
            {pending ? "Publication…" : "Publier"}
          </button>
        </div>
      </div>
      {error && <div className="error">{error}</div>}
    </div>
  );
}

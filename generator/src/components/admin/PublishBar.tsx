"use client";

import { useState, useTransition } from "react";
import { publishAction } from "@/app/admin/actions";
import { useAdminT, useAdminLang } from "./AdminI18n";

export function PublishBar({ publishedAt }: { publishedAt: string | null }) {
  const t = useAdminT();
  const lang = useAdminLang();
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
        setError(t("publish_error"));
      }
    });
  }

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <div className="card-title">{t("publish_title")}</div>
          <div className="muted">
            {last
              ? `${t("publish_last")} ${new Date(last).toLocaleString(lang === "en" ? "en-CA" : "fr-CA")}`
              : t("publish_never")}
          </div>
        </div>
        <div className="toolbar">
          <a className="btn btn-sm" href="/preview" target="_blank" rel="noreferrer">
            {t("preview")}
          </a>
          <button className="btn-primary" onClick={publish} disabled={pending}>
            {pending ? t("publish_running") : t("publish_btn")}
          </button>
        </div>
      </div>
      {error && <div className="error">{error}</div>}
    </div>
  );
}

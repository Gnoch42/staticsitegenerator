"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { importContentYaml } from "@/app/admin/actions";
import { parseContentYaml } from "@/lib/contentYaml";
import { useAdminT } from "./AdminI18n";

export function ContentYamlEditor({ initial }: { initial: string }) {
  const t = useAdminT();
  const router = useRouter();
  const [yaml, setYaml] = useState(initial);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseErr = parseContentYaml(yaml).error;

  async function save() {
    if (parseErr) return;
    if (!confirm(t("content_confirm"))) return;
    setPending(true);
    setError(null);
    try {
      const res = await importContentYaml(yaml);
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
        router.refresh();
      } else {
        setError(res.error ?? "Erreur");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="card">
      <div className="card-head">
        <span className="card-title">{t("content_title")}</span>
      </div>
      <p className="muted">{t("content_hint")}</p>
      <textarea
        className="yaml-editor"
        style={{ minHeight: "34rem" }}
        value={yaml}
        onChange={(e) => {
          setYaml(e.target.value);
          setSaved(false);
        }}
        spellCheck={false}
      />
      {parseErr && <div className="error">YAML : {parseErr}</div>}
      {error && <div className="error">{error}</div>}
      <div className="toolbar" style={{ marginTop: ".5rem" }}>
        <button className="btn-primary" onClick={save} disabled={pending || !!parseErr}>
          {pending ? "…" : t("content_import")}
        </button>
        <a className="btn" href="/admin/content">
          {t("content_reload")}
        </a>
        {saved && <span className="muted">{t("content_saved")}</span>}
      </div>
    </div>
  );
}

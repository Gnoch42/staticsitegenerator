"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { parseLocaleYaml } from "@/lib/locale";
import { parseSettingsYaml } from "@/lib/settingsYaml";
import { splitSiteYaml } from "@/lib/siteYaml";
import { useAdminT } from "./AdminI18n";

type Kind = "locale" | "settings" | "site";

function validate(kind: Kind, text: string): string | null {
  if (kind === "locale") return parseLocaleYaml(text).error;
  if (kind === "settings") return parseSettingsYaml(text).error;
  return splitSiteYaml(text).error;
}

/**
 * Éditeur YAML générique (aller-retour avec la base) : validation inline,
 * enregistrement via action serveur, téléchargement et import de fichier.
 * Réutilisé pour la locale, les réglages et le « site complet ».
 */
export function YamlSurface({
  kind,
  initial,
  title,
  hint,
  confirmMsg,
  filename,
  reloadHref,
  save,
}: {
  kind: Kind;
  initial: string;
  title: string;
  hint: string;
  confirmMsg: string;
  filename: string;
  reloadHref: string;
  save: (yaml: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const t = useAdminT();
  const router = useRouter();
  const [yaml, setYaml] = useState(initial);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const parseErr = validate(kind, yaml);

  function download() {
    const blob = new Blob([yaml], { type: "application/x-yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setYaml(await f.text());
      setSaved(false);
      setError(null);
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  async function onSave() {
    if (parseErr) return;
    if (!confirm(confirmMsg)) return;
    setPending(true);
    setError(null);
    try {
      const res = await save(yaml);
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
        <span className="card-title">{title}</span>
      </div>
      <p className="muted">{hint}</p>
      <textarea
        className="yaml-editor"
        style={{ minHeight: "24rem" }}
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
        <button className="btn-primary" onClick={onSave} disabled={pending || !!parseErr}>
          {pending ? "…" : t("yaml_save")}
        </button>
        <a className="btn" href={reloadHref}>
          {t("yaml_reload")}
        </a>
        <span className="spacer" />
        <button className="btn" onClick={download}>
          {t("yaml_download")}
        </button>
        <button className="btn" onClick={() => fileRef.current?.click()}>
          {t("yaml_upload")}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".yaml,.yml,text/yaml,application/x-yaml"
          style={{ display: "none" }}
          onChange={onFile}
        />
        {saved && <span className="muted">{t("yaml_saved")}</span>}
      </div>
    </div>
  );
}

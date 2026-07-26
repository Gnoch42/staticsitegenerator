"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { importContentYaml, exportContentYaml } from "@/app/admin/actions";
import { parseContentYaml } from "@/lib/contentYaml";
import type { ProfileOption } from "./editorTypes";
import { useAdminT } from "./AdminI18n";

export function ContentYamlEditor({
  initial,
  profiles,
}: {
  initial: string;
  profiles: ProfileOption[];
}) {
  const t = useAdminT();
  const router = useRouter();
  const [yaml, setYaml] = useState(initial);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportProfile, setExportProfile] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  const parseErr = parseContentYaml(yaml).error;

  function downloadText(text: string, filename: string) {
    const blob = new Blob([text], { type: "application/x-yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function download() {
    downloadText(yaml, "contenu-cv.yaml");
  }

  async function downloadProfile() {
    if (!exportProfile) return;
    const id = Number(exportProfile);
    const yamlForProfile = await exportContentYaml(id);
    const name = profiles.find((p) => p.id === id)?.name ?? "profil";
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    downloadText(yamlForProfile, `contenu-${slug || "profil"}.yaml`);
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
        <span className="spacer" />
        <button className="btn" onClick={download}>
          {t("content_download")}
        </button>
        <button className="btn" onClick={() => fileRef.current?.click()}>
          {t("content_upload")}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".yaml,.yml,text/yaml,application/x-yaml"
          style={{ display: "none" }}
          onChange={onFile}
        />
        {saved && <span className="muted">{t("content_saved")}</span>}
      </div>

      {profiles.length > 0 && (
        <div className="toolbar" style={{ marginTop: ".6rem" }}>
          <label style={{ margin: 0 }} className="muted">
            {t("content_export_profile")}
          </label>
          <select
            value={exportProfile}
            onChange={(e) => setExportProfile(e.target.value)}
            style={{ maxWidth: 240 }}
          >
            <option value="">—</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button className="btn" onClick={downloadProfile} disabled={!exportProfile}>
            {t("content_export_profile_btn")}
          </button>
        </div>
      )}
    </div>
  );
}

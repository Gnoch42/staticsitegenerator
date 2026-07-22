"use client";

import { useRef, useState } from "react";
import { useAdminT } from "./AdminI18n";

/**
 * Champ image du portfolio : soit une URL externe, soit un upload de
 * fichier (stocké dans le volume, servi à /uploads/<fichier>).
 */
export function ImageUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const t = useAdminT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Échec de l'upload");
      onChange(json.url as string);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de l'upload");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="image-upload">
      {value && (
        <div className="image-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" />
        </div>
      )}
      <label>{t("f_image")}</label>
      <div className="row" style={{ alignItems: "center" }}>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/uploads/… · https://…"
        />
        <div style={{ flex: "0 0 auto" }}>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
            }}
          />
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            {busy ? t("f_uploading") : t("f_upload")}
          </button>
        </div>
      </div>
      {error && <div className="error">{error}</div>}
    </div>
  );
}

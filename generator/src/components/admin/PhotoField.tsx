"use client";

import { useState, useTransition } from "react";
import { setPhotoUrl } from "@/app/admin/actions";
import { useAdminT } from "./AdminI18n";
import { ImageUpload } from "./ImageUpload";

export function PhotoField({ initial }: { initial: string }) {
  const t = useAdminT();
  const [url, setUrl] = useState(initial);
  const [, startTransition] = useTransition();

  function update(next: string) {
    setUrl(next);
    startTransition(() => setPhotoUrl(next));
  }

  return (
    <div style={{ marginTop: "1rem" }}>
      <span className="lang-tag">{t("photo_label")}</span>
      <p className="muted" style={{ marginTop: ".2rem" }}>{t("photo_hint")}</p>
      <ImageUpload value={url} onChange={update} />
    </div>
  );
}

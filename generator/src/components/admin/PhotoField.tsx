"use client";

import { useState, useTransition } from "react";
import { setPhotoUrl, setPhotoProfiles } from "@/app/admin/actions";
import { useAdminT } from "./AdminI18n";
import { ImageUpload } from "./ImageUpload";
import { ProfileTags } from "./ProfileTags";
import type { ProfileOption } from "./editorTypes";

export function PhotoField({
  initial,
  profiles,
  photoProfileIds,
}: {
  initial: string;
  profiles: ProfileOption[];
  photoProfileIds: number[];
}) {
  const t = useAdminT();
  const [url, setUrl] = useState(initial);
  const [ids, setIds] = useState<number[]>(photoProfileIds);
  const [, startTransition] = useTransition();

  function update(next: string) {
    setUrl(next);
    startTransition(() => setPhotoUrl(next));
  }
  function updateProfiles(next: number[]) {
    setIds(next);
    startTransition(() => setPhotoProfiles(next));
  }

  return (
    <div style={{ marginTop: "1rem" }}>
      <span className="lang-tag">{t("photo_label")}</span>
      <p className="muted" style={{ marginTop: ".2rem" }}>{t("photo_hint")}</p>
      <ImageUpload value={url} onChange={update} />
      {url && (
        <ProfileTags profiles={profiles} selected={ids} onChange={updateProfiles} />
      )}
    </div>
  );
}

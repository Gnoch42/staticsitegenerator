"use client";

import type { ProfileOption } from "./editorTypes";
import { useAdminT } from "./AdminI18n";

/**
 * Tags de profils cliquables (multi-sélection) pour un item.
 * Aucun tag sélectionné = l'item est "toujours inclus" (dans tous les profils).
 */
export function ProfileTags({
  profiles,
  selected,
  onChange,
}: {
  profiles: ProfileOption[];
  selected: number[];
  onChange: (ids: number[]) => void;
}) {
  const t = useAdminT();
  if (profiles.length === 0) return null;

  function toggle(id: number) {
    onChange(
      selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id],
    );
  }

  return (
    <div className="profile-tags">
      <span className="lang-tag">{t("item_profiles_label")} :</span>
      {selected.length === 0 && (
        <span className="muted profile-all">{t("item_profiles_all")}</span>
      )}
      {profiles.map((p) => {
        const on = selected.includes(p.id);
        return (
          <button
            key={p.id}
            type="button"
            className={`profile-chip${on ? " on" : ""}`}
            onClick={() => toggle(p.id)}
          >
            {p.name}
          </button>
        );
      })}
    </div>
  );
}

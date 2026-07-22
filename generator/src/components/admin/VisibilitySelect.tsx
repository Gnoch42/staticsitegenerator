"use client";

import type { Visibility } from "@/lib/types";
import { useAdminT } from "./AdminI18n";

/** Sélecteur de visibilité (en ligne / imprimé / les deux). */
export function VisibilitySelect({
  value,
  onChange,
  title,
}: {
  value: Visibility;
  onChange: (v: Visibility) => void;
  title?: string;
}) {
  const t = useAdminT();
  const options: { value: Visibility; label: string }[] = [
    { value: "both", label: t("vis_both") },
    { value: "online", label: t("vis_online") },
    { value: "print", label: t("vis_print") },
  ];
  return (
    <select
      className="vis-select"
      value={value}
      title={title ?? t("vis_where")}
      onChange={(e) => onChange(e.target.value as Visibility)}
      style={{ width: "auto", fontSize: ".8rem", padding: ".25rem .4rem" }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

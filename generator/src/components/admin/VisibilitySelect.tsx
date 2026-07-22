"use client";

import type { Visibility } from "@/lib/types";

const OPTIONS: { value: Visibility; label: string }[] = [
  { value: "both", label: "En ligne + PDF" },
  { value: "online", label: "En ligne seulement" },
  { value: "print", label: "PDF seulement" },
];

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
  return (
    <select
      className="vis-select"
      value={value}
      title={title ?? "Où afficher ?"}
      onChange={(e) => onChange(e.target.value as Visibility)}
      style={{ width: "auto", fontSize: ".8rem", padding: ".25rem .4rem" }}
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

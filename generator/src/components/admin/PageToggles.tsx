"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { setPageEnabled } from "@/app/admin/actions";

export interface PageRow {
  id: number;
  type: string;
  label: string;
  enabled: boolean;
  sectionCount: number;
}

export function PageToggles({ pages }: { pages: PageRow[] }) {
  const [rows, setRows] = useState(pages);
  const [pending, startTransition] = useTransition();

  function toggle(id: number, enabled: boolean) {
    setRows((prev) => prev.map((p) => (p.id === id ? { ...p, enabled } : p)));
    startTransition(() => setPageEnabled(id, enabled));
  }

  return (
    <div>
      <p className="muted">
        Décochez un onglet pour le retirer du site publié (il reste éditable ici).
      </p>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {rows.map((p) => (
          <li
            key={p.id}
            className="card-head"
            style={{ padding: ".5rem 0", borderBottom: "1px solid var(--admin-border)" }}
          >
            <label style={{ display: "flex", gap: ".5rem", alignItems: "center", margin: 0 }}>
              <input
                type="checkbox"
                style={{ width: "auto" }}
                checked={p.enabled}
                disabled={pending}
                onChange={(e) => toggle(p.id, e.target.checked)}
              />
              <span className="card-title">{p.label}</span>
              <span className="muted">· {p.sectionCount} section(s)</span>
            </label>
            <Link className="btn btn-sm" href={`/admin/${p.type}`}>
              Éditer
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

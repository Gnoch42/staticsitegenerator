"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { setPageEnabled } from "@/app/admin/actions";
import { useAdminT } from "./AdminI18n";

export interface PageRow {
  id: number;
  type: string;
  label: string;
  enabled: boolean;
  sectionCount: number;
}

export function PageToggles({ pages }: { pages: PageRow[] }) {
  const t = useAdminT();
  const [rows, setRows] = useState(pages);
  const [pending, startTransition] = useTransition();

  function toggle(id: number, enabled: boolean) {
    setRows((prev) => prev.map((p) => (p.id === id ? { ...p, enabled } : p)));
    startTransition(() => setPageEnabled(id, enabled));
  }

  return (
    <div>
      <p className="muted">{t("pages_hint")}</p>
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
              <span className="muted">· {p.sectionCount} {t("page_sections")}</span>
            </label>
            <Link className="btn btn-sm" href={`/admin/${p.type}`}>
              {t("edit")}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

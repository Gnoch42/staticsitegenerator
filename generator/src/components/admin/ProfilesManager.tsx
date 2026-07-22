"use client";

import { useState, useTransition } from "react";
import type { Profile } from "@/db/schema";
import {
  createProfile,
  renameProfile,
  deleteProfile,
  setActiveProfile,
} from "@/app/admin/actions";
import { useAdminT } from "./AdminI18n";

export function ProfilesManager({
  profiles,
  activeProfileId,
}: {
  profiles: Profile[];
  activeProfileId: number | null;
}) {
  const t = useAdminT();
  const [rows, setRows] = useState(profiles);
  const [active, setActive] = useState<number | null>(activeProfileId);
  const [name, setName] = useState("");
  const [, startTransition] = useTransition();

  async function add() {
    const clean = name.trim();
    if (!clean) return;
    const { id } = await createProfile(clean);
    setRows((r) => [...r, { id, name: clean, slug: "", position: r.length }]);
    setName("");
  }

  function rename(id: number, newName: string) {
    setRows((r) => r.map((p) => (p.id === id ? { ...p, name: newName } : p)));
  }
  function persistRename(id: number, newName: string) {
    startTransition(() => renameProfile(id, newName));
  }

  async function remove(id: number) {
    if (!confirm(t("delete") + " ?")) return;
    await deleteProfile(id);
    setRows((r) => r.filter((p) => p.id !== id));
    if (active === id) setActive(null);
  }

  function changeActive(v: string) {
    const id = v === "" ? null : Number(v);
    setActive(id);
    startTransition(() => setActiveProfile(id));
  }

  return (
    <div>
      <p className="muted">{t("profiles_hint")}</p>

      <label>{t("profile_active")}</label>
      <select value={active ?? ""} onChange={(e) => changeActive(e.target.value)} style={{ maxWidth: 320 }}>
        <option value="">{t("profile_full_cv")}</option>
        {rows.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <div style={{ marginTop: "1rem" }}>
        {rows.length === 0 && <p className="muted">{t("profile_none")}</p>}
        {rows.map((p) => (
          <div key={p.id} className="row" style={{ alignItems: "center", marginBottom: ".4rem" }}>
            <input
              value={p.name}
              onChange={(e) => rename(p.id, e.target.value)}
              onBlur={(e) => persistRename(p.id, e.target.value)}
            />
            <div style={{ flex: "0 0 auto" }}>
              <button className="btn btn-sm btn-danger" onClick={() => remove(p.id)}>
                {t("delete")}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="row" style={{ alignItems: "center", marginTop: ".6rem" }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("profile_new_ph")}
          onKeyDown={(e) => {
            if (e.key === "Enter") add();
          }}
        />
        <div style={{ flex: "0 0 auto" }}>
          <button className="btn-primary" onClick={add}>
            {t("profile_add")}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { setOwnerName } from "@/app/admin/actions";
import { useAdminT } from "./AdminI18n";

export function OwnerNameField({ initial }: { initial: string }) {
  const t = useAdminT();
  const [name, setName] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function save() {
    startTransition(async () => {
      await setOwnerName(name);
      setSaved(true);
    });
  }

  return (
    <div>
      <p className="muted">{t("identity_hint")}</p>
      <div className="row" style={{ alignItems: "center" }}>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSaved(false);
          }}
          placeholder={t("identity_name_ph")}
        />
        <div style={{ flex: "0 0 auto" }}>
          <button className="btn-primary" onClick={save} disabled={pending}>
            {pending ? "…" : t("save")}
          </button>
        </div>
        {saved && <span className="muted">{t("saved")}</span>}
      </div>
    </div>
  );
}

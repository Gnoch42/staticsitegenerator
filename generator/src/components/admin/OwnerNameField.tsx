"use client";

import { useState, useTransition } from "react";
import { setOwnerName } from "@/app/admin/actions";

export function OwnerNameField({ initial }: { initial: string }) {
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
      <p className="muted">Affiché en en-tête du site et du CV.</p>
      <div className="row" style={{ alignItems: "center" }}>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSaved(false);
          }}
          placeholder="Prénom Nom"
        />
        <div style={{ flex: "0 0 auto" }}>
          <button className="btn-primary" onClick={save} disabled={pending}>
            {pending ? "…" : "Enregistrer"}
          </button>
        </div>
        {saved && <span className="muted">Enregistré ✓</span>}
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { LANG_NAMES } from "@/lib/i18n";
import { setLanguages } from "@/app/admin/actions";

const AVAILABLE = ["fr", "en", "es", "de"];

export function LanguageSettings({
  languages,
  defaultLanguage,
}: {
  languages: string[];
  defaultLanguage: string;
}) {
  const [langs, setLangs] = useState<string[]>(languages);
  const [def, setDef] = useState(defaultLanguage);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function toggle(code: string) {
    setSaved(false);
    setLangs((prev) =>
      prev.includes(code) ? prev.filter((l) => l !== code) : [...prev, code],
    );
  }

  function save() {
    const finalDef = langs.includes(def) ? def : langs[0];
    setDef(finalDef);
    startTransition(async () => {
      await setLanguages(langs, finalDef);
      setSaved(true);
    });
  }

  return (
    <div>
      <div className="row">
        {AVAILABLE.map((code) => (
          <label
            key={code}
            style={{ display: "flex", gap: ".4rem", alignItems: "center", flex: "0 0 auto" }}
          >
            <input
              type="checkbox"
              style={{ width: "auto" }}
              checked={langs.includes(code)}
              onChange={() => toggle(code)}
            />
            {LANG_NAMES[code] ?? code}
          </label>
        ))}
      </div>

      <label>Langue par défaut</label>
      <select
        value={def}
        onChange={(e) => {
          setDef(e.target.value);
          setSaved(false);
        }}
        style={{ maxWidth: 240 }}
      >
        {langs.map((l) => (
          <option key={l} value={l}>
            {LANG_NAMES[l] ?? l}
          </option>
        ))}
      </select>

      <div className="toolbar" style={{ marginTop: ".75rem" }}>
        <button className="btn-primary" onClick={save} disabled={pending || langs.length === 0}>
          {pending ? "…" : "Enregistrer"}
        </button>
        {saved && <span className="muted">Enregistré ✓</span>}
      </div>
    </div>
  );
}

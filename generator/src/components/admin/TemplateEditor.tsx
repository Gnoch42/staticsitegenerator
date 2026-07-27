"use client";

import { useState } from "react";
import {
  createCustomTemplate,
  updateCustomTemplateYaml,
  deleteCustomTemplate,
  resetTemplateToBuiltin,
} from "@/app/admin/actions";
import { parseTemplateConfig } from "@/lib/templateConfig";
import { useAdminT } from "./AdminI18n";

interface CustomTpl {
  id: string;
  name: string;
  yaml: string;
}

export function TemplateEditor({
  templates,
  builtinIds = [],
}: {
  templates: CustomTpl[];
  builtinIds?: string[];
}) {
  const t = useAdminT();
  const [rows, setRows] = useState<CustomTpl[]>(templates);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);

  async function create() {
    setBusy(true);
    try {
      const name = newName.trim() || "Template";
      const { id, yaml } = await createCustomTemplate(name);
      setRows((r) => [...r, { id, name, yaml }]);
      setNewName("");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm(t("delete") + " ?")) return;
    await deleteCustomTemplate(id);
    setRows((r) => r.filter((x) => x.id !== id));
  }

  return (
    <div>
      <p className="muted">{t("yaml_hint")}</p>

      {rows.length === 0 && <p className="muted">{t("yaml_none")}</p>}

      {rows.map((tpl) => (
        <RowEditor
          key={tpl.id}
          tpl={tpl}
          isBuiltin={builtinIds.includes(tpl.id)}
          onRemove={() => remove(tpl.id)}
        />
      ))}

      <div className="row" style={{ alignItems: "center", marginTop: ".6rem" }}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={t("yaml_new_ph")}
          onKeyDown={(e) => e.key === "Enter" && create()}
        />
        <div style={{ flex: "0 0 auto" }}>
          <button className="btn-primary" onClick={create} disabled={busy}>
            {t("yaml_create")}
          </button>
        </div>
      </div>
    </div>
  );
}

function RowEditor({
  tpl,
  isBuiltin,
  onRemove,
}: {
  tpl: CustomTpl;
  isBuiltin: boolean;
  onRemove: () => void;
}) {
  const t = useAdminT();
  const [open, setOpen] = useState(false);
  const [yaml, setYaml] = useState(tpl.yaml);
  const [name, setName] = useState(tpl.name);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  const { error } = parseTemplateConfig(yaml);

  async function save() {
    if (error) return;
    setPending(true);
    try {
      await updateCustomTemplateYaml(tpl.id, yaml);
      const parsed = parseTemplateConfig(yaml).name;
      if (parsed) setName(parsed);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setPending(false);
    }
  }

  async function reset() {
    if (!confirm(t("yaml_reset_confirm"))) return;
    const res = await resetTemplateToBuiltin(tpl.id);
    if ("yaml" in res) {
      setYaml(res.yaml);
      const parsed = parseTemplateConfig(res.yaml).name;
      if (parsed) setName(parsed);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <div className="card" style={{ marginBottom: ".6rem" }}>
      <div className="card-head">
        <div className="toolbar">
          <button className="btn btn-sm" onClick={() => setOpen((o) => !o)}>
            {open ? "▾" : "▸"}
          </button>
          <strong>{name}</strong>
          <span className="muted">
            ({tpl.id}
            {isBuiltin ? ` · ${t("yaml_builtin_tag")}` : ""})
          </span>
        </div>
        {!isBuiltin && (
          <button className="btn btn-sm btn-danger" onClick={onRemove}>
            {t("delete")}
          </button>
        )}
      </div>
      {open && (
        <div style={{ marginTop: ".6rem" }}>
          <textarea
            className="yaml-editor"
            value={yaml}
            onChange={(e) => {
              setYaml(e.target.value);
              setSaved(false);
            }}
            spellCheck={false}
          />
          {error && <div className="error">YAML : {error}</div>}
          <div className="toolbar" style={{ marginTop: ".5rem" }}>
            <button className="btn-primary" onClick={save} disabled={pending || !!error}>
              {pending ? "…" : t("save")}
            </button>
            {isBuiltin && (
              <button className="btn" onClick={reset}>
                {t("yaml_reset")}
              </button>
            )}
            {saved && <span className="muted">{t("saved")}</span>}
            <span className="spacer" />
            <span className="muted">{t("yaml_preview_note")}</span>
          </div>
        </div>
      )}
    </div>
  );
}

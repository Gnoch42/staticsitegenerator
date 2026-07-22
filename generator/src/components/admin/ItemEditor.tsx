"use client";

import { useState, useTransition } from "react";
import type { SectionType, Visibility } from "@/lib/types";
import { LANG_NAMES } from "@/lib/i18n";
import { MULTILINGUAL_FIELDS, FLAT_FIELDS } from "@/lib/itemDefaults";
import { translateAction } from "@/app/admin/actions";
import type { EditorItem, ProfileOption } from "./editorTypes";
import { VisibilitySelect } from "./VisibilitySelect";
import { ImageUpload } from "./ImageUpload";
import { ProfileTags } from "./ProfileTags";
import { useAdminT } from "./AdminI18n";

// Clé de traduction pour un champ multilingue (f_title, f_venue…).
const FIELD_KEY: Record<string, string> = {
  title: "f_title",
  organization: "f_organization",
  location: "f_location",
  description: "f_description",
  text: "f_text",
  heading: "f_heading",
  body: "f_body",
  category: "f_category",
  value: "f_value",
  venue: "f_venue",
  abstract: "f_abstract",
};
// Clé de traduction pour un champ "flat" (dates, année…).
const FLAT_KEY: Record<string, string> = {
  start_date: "f_start",
  end_date: "f_end",
  year: "f_year",
  authors: "f_authors",
  link: "f_doi",
};

const CONTACT_KINDS = [
  "email",
  "phone",
  "linkedin",
  "github",
  "website",
  "location",
  "other",
];

export function ItemEditor({
  sectionType,
  item,
  langs,
  index,
  count,
  profiles,
  onChange,
  onDelete,
  onMove,
  onVisibilityChange,
  onProfilesChange,
}: {
  sectionType: SectionType;
  item: EditorItem;
  langs: string[];
  index: number;
  count: number;
  profiles: ProfileOption[];
  onChange: (data: Record<string, unknown>) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
  onVisibilityChange: (v: Visibility) => void;
  onProfilesChange: (ids: number[]) => void;
}) {
  const t = useAdminT();
  const [data, setData] = useState<Record<string, unknown>>(item.data);
  const [translating, startTranslate] = useTransition();

  function commit(next: Record<string, unknown>) {
    setData(next);
  }
  function persist(next: Record<string, unknown>) {
    onChange(next);
  }

  // ── accès aux valeurs ──
  function nested(lang: string, field: string): string {
    const l = data[lang];
    return l && typeof l === "object"
      ? String((l as Record<string, unknown>)[field] ?? "")
      : "";
  }
  function setNested(lang: string, field: string, value: string) {
    const l = (data[lang] as Record<string, unknown>) ?? {};
    commit({ ...data, [lang]: { ...l, [field]: value } });
  }
  function flat(key: string): string {
    return data[key] === undefined || data[key] === null ? "" : String(data[key]);
  }
  function setFlat(key: string, value: string | number) {
    commit({ ...data, [key]: value });
  }
  function multi(key: string, lang: string): string {
    const m = data[key];
    return m && typeof m === "object"
      ? String((m as Record<string, unknown>)[lang] ?? "")
      : "";
  }
  function setMulti(key: string, lang: string, value: string) {
    const m = (data[key] as Record<string, unknown>) ?? {};
    commit({ ...data, [key]: { ...m, [lang]: value } });
  }

  // ── traduction automatique de l'item ──
  function translateItem() {
    startTranslate(async () => {
      let next = { ...data };
      const source = langs[0];

      // champs nested multilingues
      const fields = MULTILINGUAL_FIELDS[sectionType] ?? [];
      for (const field of fields) {
        const srcVal =
          (next[source] as Record<string, unknown>)?.[field] ?? "";
        if (!srcVal) continue;
        for (const to of langs.slice(1)) {
          const txt = await translateAction(String(srcVal), source, to);
          const l = (next[to] as Record<string, unknown>) ?? {};
          next = { ...next, [to]: { ...l, [field]: txt } };
        }
      }
      // champs multilingues "flat" (label / caption)
      for (const key of ["label", "caption"]) {
        if (!next[key]) continue;
        const srcVal = (next[key] as Record<string, unknown>)[source] ?? "";
        if (!srcVal) continue;
        for (const to of langs.slice(1)) {
          const txt = await translateAction(String(srcVal), source, to);
          const m = next[key] as Record<string, unknown>;
          next = { ...next, [key]: { ...m, [to]: txt } };
        }
      }
      commit(next);
      persist(next);
    });
  }

  const multiFields = MULTILINGUAL_FIELDS[sectionType] ?? [];
  const flatFields = FLAT_FIELDS[sectionType] ?? [];
  const isContact = sectionType === "contact" || sectionType === "contact_links";
  const isVideo = sectionType === "video_embed";
  const isPortfolio = sectionType === "portfolio_gallery";

  return (
    <div className="item-block">
      <div className="card-head" style={{ marginBottom: ".5rem" }}>
        <span className="muted">{t("item_word")} {index + 1}</span>
        <div className="toolbar">
          <VisibilitySelect
            value={item.visibility}
            onChange={onVisibilityChange}
            title={t("vis_item")}
          />
          {langs.length > 1 && (
            <button className="btn btn-sm" onClick={translateItem} disabled={translating}>
              {translating ? "…" : t("translate")}
            </button>
          )}
          <button className="btn btn-sm" onClick={() => onMove(-1)} disabled={index === 0}>
            ↑
          </button>
          <button
            className="btn btn-sm"
            onClick={() => onMove(1)}
            disabled={index === count - 1}
          >
            ↓
          </button>
          <button className="btn btn-sm btn-danger" onClick={onDelete}>
            ✕
          </button>
        </div>
      </div>

      <ProfileTags
        profiles={profiles}
        selected={item.profileIds}
        onChange={onProfilesChange}
      />

      {/* Portfolio : image + légende */}
      {isPortfolio && (
        <>
          <ImageUpload
            value={flat("image")}
            onChange={(url) => {
              const next = { ...data, image: url };
              commit(next);
              persist(next);
            }}
          />
          <div className="row">
            <div>
              <label>{t("f_alt")}</label>
              <input value={flat("alt")} onChange={(e) => setFlat("alt", e.target.value)} onBlur={() => persist(data)} />
            </div>
            <div>
              <label>{t("f_link")}</label>
              <input value={flat("link")} onChange={(e) => setFlat("link", e.target.value)} onBlur={() => persist(data)} placeholder="https://…" />
            </div>
          </div>
          <div className="lang-cols">
            {langs.map((lang) => (
              <div key={lang} className="lang-col">
                <span className="lang-tag">{t("f_caption")} — {LANG_NAMES[lang] ?? lang}</span>
                <input value={multi("caption", lang)} onChange={(e) => setMulti("caption", lang, e.target.value)} onBlur={() => persist(data)} />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Contact / liens de contact */}
      {isContact && (
        <>
          <div className="row">
            <div>
              <label>{t("f_type")}</label>
              <select value={flat("kind")} onChange={(e) => { setFlat("kind", e.target.value); }} onBlur={() => persist(data)}>
                {CONTACT_KINDS.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
            <div>
              <label>{t("f_value")}</label>
              <input value={flat("value")} onChange={(e) => setFlat("value", e.target.value)} onBlur={() => persist(data)} />
            </div>
          </div>
          <div className="lang-cols">
            {langs.map((lang) => (
              <div key={lang} className="lang-col">
                <span className="lang-tag">{t("f_label")} — {LANG_NAMES[lang] ?? lang}</span>
                <input value={multi("label", lang)} onChange={(e) => setMulti("label", lang, e.target.value)} onBlur={() => persist(data)} />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Vidéo */}
      {isVideo && (
        <>
          <div className="row">
            <div>
              <label>{t("f_provider")}</label>
              <select value={flat("provider")} onChange={(e) => setFlat("provider", e.target.value)} onBlur={() => persist(data)}>
                <option value="youtube">YouTube</option>
                <option value="vimeo">Vimeo</option>
              </select>
            </div>
            <div style={{ flex: "2 1 300px" }}>
              <label>{t("f_url")}</label>
              <input value={flat("url")} onChange={(e) => setFlat("url", e.target.value)} onBlur={() => persist(data)} placeholder="https://youtube.com/watch?v=…" />
            </div>
          </div>
          <div className="lang-cols">
            {langs.map((lang) => (
              <div key={lang} className="lang-col">
                <span className="lang-tag">{t("f_caption")} — {LANG_NAMES[lang] ?? lang}</span>
                <input value={multi("caption", lang)} onChange={(e) => setMulti("caption", lang, e.target.value)} onBlur={() => persist(data)} />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Champs simples (dates, année, auteurs, lien) */}
      {!isContact && !isVideo && flatFields.length > 0 && (
        <div className="row">
          {flatFields.map((f) => (
            <div key={f.key}>
              <label>{FLAT_KEY[f.key] ? t(FLAT_KEY[f.key]) : f.label}</label>
              <input
                type={f.type ?? "text"}
                value={flat(f.key)}
                onChange={(e) =>
                  setFlat(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)
                }
                onBlur={() => persist(data)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Champs multilingues structurés par langue */}
      {!isContact && !isVideo && multiFields.length > 0 && (
        <div className="lang-cols">
          {langs.map((lang) => (
            <div key={lang} className="lang-col">
              <span className="lang-tag">{LANG_NAMES[lang] ?? lang}</span>
              {multiFields.map((field) => (
                <div key={field}>
                  <label>{FIELD_KEY[field] ? t(FIELD_KEY[field]) : field}</label>
                  {field === "description" || field === "abstract" || field === "body" ? (
                    <textarea
                      value={nested(lang, field)}
                      onChange={(e) => setNested(lang, field, e.target.value)}
                      onBlur={() => persist(data)}
                    />
                  ) : (
                    <input
                      value={nested(lang, field)}
                      onChange={(e) => setNested(lang, field, e.target.value)}
                      onBlur={() => persist(data)}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

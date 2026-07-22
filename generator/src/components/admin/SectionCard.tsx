"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Multilingual, Visibility } from "@/lib/types";
import { LANG_NAMES } from "@/lib/i18n";
import { defaultItemData } from "@/lib/itemDefaults";
import {
  updateSection,
  deleteSection,
  addItem,
  updateItem,
  deleteItem,
  reorderItems,
  setItemVisibility,
  setItemProfiles,
} from "@/app/admin/actions";
import type { EditorSection, ProfileOption } from "./editorTypes";
import { ItemEditor } from "./ItemEditor";
import { VisibilitySelect } from "./VisibilitySelect";
import { useAdminT } from "./AdminI18n";

export function SectionCard({
  section,
  langs,
  defaultLang,
  profiles,
  onPatch,
  onRemove,
}: {
  section: EditorSection;
  langs: string[];
  defaultLang: string;
  profiles: ProfileOption[];
  onPatch: (patch: Partial<EditorSection>) => void;
  onRemove: () => void;
}) {
  const t = useAdminT();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });
  const [open, setOpen] = useState(true);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  function setTitle(lang: string, value: string) {
    onPatch({ title: { ...section.title, [lang]: value } });
  }
  function saveTitle(title: Multilingual) {
    updateSection(section.id, { title });
  }

  function toggleEnabled() {
    const enabled = !section.enabled;
    onPatch({ enabled });
    updateSection(section.id, { enabled });
  }

  function changeVisibility(visibility: Visibility) {
    onPatch({ visibility });
    updateSection(section.id, { visibility });
  }

  function changeItemVisibility(itemId: number, visibility: Visibility) {
    onPatch({
      items: section.items.map((it) =>
        it.id === itemId ? { ...it, visibility } : it,
      ),
    });
    setItemVisibility(itemId, visibility);
  }

  function changeItemProfiles(itemId: number, profileIds: number[]) {
    onPatch({
      items: section.items.map((it) =>
        it.id === itemId ? { ...it, profileIds } : it,
      ),
    });
    setItemProfiles(itemId, profileIds);
  }

  async function handleDelete() {
    if (!confirm(t("section_delete_confirm"))) return;
    await deleteSection(section.id);
    onRemove();
  }

  async function handleAddItem() {
    const { id } = await addItem(section.id, section.type, langs);
    const data = defaultItemData(section.type, langs);
    onPatch({
      items: [...section.items, { id, data, visibility: "both", profileIds: [] }],
    });
  }

  function handleItemChange(itemId: number, data: Record<string, unknown>) {
    onPatch({
      items: section.items.map((it) =>
        it.id === itemId ? { ...it, data } : it,
      ),
    });
    updateItem(itemId, data);
  }

  async function handleItemDelete(itemId: number) {
    await deleteItem(itemId);
    onPatch({ items: section.items.filter((it) => it.id !== itemId) });
  }

  function moveItem(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= section.items.length) return;
    const next = [...section.items];
    [next[index], next[target]] = [next[target], next[index]];
    onPatch({ items: next });
    reorderItems(next.map((it) => it.id));
  }

  return (
    <div className="card" ref={setNodeRef} style={style}>
      <div className="card-head">
        <div className="toolbar">
          <span className="drag-handle" {...attributes} {...listeners} title={t("drag")}>
            ⠿
          </span>
          <button
            className="btn btn-sm"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
          >
            {open ? "▾" : "▸"}
          </button>
          <strong>{section.title[defaultLang] || section.type}</strong>
          <span className="muted">({section.type})</span>
        </div>
        <div className="toolbar">
          <VisibilitySelect
            value={section.visibility}
            onChange={changeVisibility}
            title={t("vis_section")}
          />
          <label style={{ display: "flex", gap: ".35rem", alignItems: "center", margin: 0 }}>
            <input
              type="checkbox"
              style={{ width: "auto" }}
              checked={section.enabled}
              onChange={toggleEnabled}
            />
            <span className="muted">{t("enabled")}</span>
          </label>
          <button className="btn btn-sm btn-danger" onClick={handleDelete}>
            {t("delete")}
          </button>
        </div>
      </div>

      {open && (
        <div style={{ marginTop: ".75rem" }}>
          <div className="lang-cols">
            {langs.map((lang) => (
              <div key={lang} className="lang-col">
                <span className="lang-tag">{t("title_word")} — {LANG_NAMES[lang] ?? lang}</span>
                <input
                  value={section.title[lang] ?? ""}
                  onChange={(e) => setTitle(lang, e.target.value)}
                  onBlur={() => saveTitle(section.title)}
                />
              </div>
            ))}
          </div>

          <div style={{ marginTop: "1rem" }}>
            {section.items.map((item, i) => (
              <ItemEditor
                key={item.id}
                sectionType={section.type}
                item={item}
                langs={langs}
                index={i}
                count={section.items.length}
                profiles={profiles}
                onChange={(data) => handleItemChange(item.id, data)}
                onDelete={() => handleItemDelete(item.id)}
                onMove={(dir) => moveItem(i, dir)}
                onVisibilityChange={(v) => changeItemVisibility(item.id, v)}
                onProfilesChange={(ids) => changeItemProfiles(item.id, ids)}
              />
            ))}
          </div>

          <button className="btn btn-sm" onClick={handleAddItem}>
            + {t("item_add")}
          </button>
        </div>
      )}
    </div>
  );
}

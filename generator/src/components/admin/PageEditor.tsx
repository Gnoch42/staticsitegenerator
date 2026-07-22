"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { SectionType } from "@/lib/types";
import { SECTION_LABELS } from "@/lib/types";
import { addSection, reorderSections } from "@/app/admin/actions";
import type { EditorSection, AllowedSection, ProfileOption } from "./editorTypes";
import { SectionCard } from "./SectionCard";
import { useAdminT } from "./AdminI18n";

export function PageEditor({
  pageId,
  pageType,
  initialSections,
  langs,
  defaultLang,
  allowedSectionTypes,
  profiles,
}: {
  pageId: number;
  pageType: string;
  initialSections: EditorSection[];
  langs: string[];
  defaultLang: string;
  allowedSectionTypes: AllowedSection[];
  profiles: ProfileOption[];
}) {
  const t = useAdminT();
  const [sections, setSections] = useState<EditorSection[]>(initialSections);
  const [newType, setNewType] = useState<SectionType>(
    allowedSectionTypes[0]?.type ?? "custom",
  );
  const [busy, setBusy] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setSections((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === active.id);
      const newIndex = prev.findIndex((s) => s.id === over.id);
      const next = arrayMove(prev, oldIndex, newIndex);
      reorderSections(next.map((s) => s.id));
      return next;
    });
  }

  async function handleAdd() {
    setBusy(true);
    try {
      const { id } = await addSection(pageId, newType, pageType);
      setSections((prev) => [
        ...prev,
        {
          id,
          type: newType,
          enabled: true,
          title: { ...SECTION_LABELS[newType] },
          visibility: "both",
          items: [],
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function patchSection(id: number, patch: Partial<EditorSection>) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    );
  }

  function removeSection(id: number) {
    setSections((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {sections.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              langs={langs}
              defaultLang={defaultLang}
              profiles={profiles}
              onPatch={(patch) => patchSection(section.id, patch)}
              onRemove={() => removeSection(section.id)}
            />
          ))}
        </SortableContext>
      </DndContext>

      {sections.length === 0 && <p className="muted">{t("section_none")}</p>}

      <div className="card">
        <div className="toolbar">
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as SectionType)}
            style={{ maxWidth: 260 }}
          >
            {allowedSectionTypes.map((a) => (
              <option key={a.type} value={a.type}>
                {a.label}
              </option>
            ))}
          </select>
          <button className="btn-primary" onClick={handleAdd} disabled={busy}>
            + {t("section_add")}
          </button>
        </div>
      </div>
    </div>
  );
}

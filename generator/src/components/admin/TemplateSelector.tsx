"use client";

import { useState, useTransition } from "react";
import type { Template } from "@/db/schema";
import { setTemplate } from "@/app/admin/actions";

export function TemplateSelector({
  templates,
  current,
}: {
  templates: Template[];
  current: string;
}) {
  const [selected, setSelected] = useState(current);
  const [pending, startTransition] = useTransition();

  function choose(id: string) {
    setSelected(id);
    startTransition(() => setTemplate(id));
  }

  return (
    <div className="template-grid">
      {templates.map((tpl) => (
        <button
          key={tpl.id}
          className={`template-option${selected === tpl.id ? " selected" : ""}`}
          onClick={() => choose(tpl.id)}
          disabled={pending}
          type="button"
        >
          <div className="template-thumb" />
          <div className="card-title">{tpl.name}</div>
          <div className="muted">{tpl.id}</div>
        </button>
      ))}
    </div>
  );
}

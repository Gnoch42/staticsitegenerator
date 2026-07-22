import type { ComponentType } from "react";
import type { TemplateProps } from "./types";
import MinimalTemplate from "./minimal/Template";
import StructuredTemplate from "./structured/Template";
import AcademicTemplate from "./academic/Template";
import ModernTemplate from "./modern/Template";
import SlateTemplate from "./slate/Template";

/** Registre des templates : id → composant de rendu + fichier CSS. */
export const TEMPLATES: Record<
  string,
  { component: ComponentType<TemplateProps>; css: string }
> = {
  minimal: { component: MinimalTemplate, css: "minimal.css" },
  structured: { component: StructuredTemplate, css: "structured.css" },
  academic: { component: AcademicTemplate, css: "academic.css" },
  modern: { component: ModernTemplate, css: "modern.css" },
  slate: { component: SlateTemplate, css: "slate.css" },
};

export function getTemplate(id: string) {
  return TEMPLATES[id] ?? TEMPLATES.structured;
}

export type { TemplateProps };

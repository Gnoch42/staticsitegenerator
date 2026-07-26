import type { ComponentType } from "react";
import type { TemplateProps } from "./types";
import StructuredTemplate from "./structured/Template";
import AcademicTemplate from "./academic/Template";

/**
 * Registre de secours : tous les templates sont désormais du YAML (rendus
 * par YamlTemplate) ; ces composants ne servent que de repli si un template
 * n'avait pas de YAML.
 */
export const TEMPLATES: Record<
  string,
  { component: ComponentType<TemplateProps>; css: string }
> = {
  structured: { component: StructuredTemplate, css: "structured.css" },
  academic: { component: AcademicTemplate, css: "academic.css" },
};

export function getTemplate(id: string) {
  return TEMPLATES[id] ?? TEMPLATES.structured;
}

export type { TemplateProps };

import "server-only";
import { promises as fs } from "node:fs";
import { join } from "node:path";
import type { ComponentType } from "react";
import type { Template } from "@/db/schema";
import { getTemplate } from "@/templates";
import type { TemplateProps } from "@/templates/types";
import YamlTemplate from "@/templates/yaml/YamlTemplate";
import {
  parseTemplateConfig,
  generateThemeCss,
  type TemplateConfig,
} from "./templateConfig";

const THEMES_DIR = join(process.cwd(), "public", "themes");

export function isCustom(template: Template): boolean {
  return !!template.yaml;
}

/** Composant de rendu à utiliser pour ce template. */
export function templateComponent(
  template: Template,
): ComponentType<TemplateProps> {
  return isCustom(template) ? YamlTemplate : getTemplate(template.id).component;
}

/** Config YAML (uniquement pour un template personnalisé). */
export function templateConfig(template: Template): TemplateConfig | undefined {
  return isCustom(template)
    ? parseTemplateConfig(template.yaml).config
    : undefined;
}

/** Nom de fichier CSS de la couche thème dans /assets. */
export function themeAssetName(template: Template): string {
  return isCustom(template) ? "theme.css" : getTemplate(template.id).css;
}

/** Contenu CSS de la couche thème (fichier intégré, ou généré depuis le YAML). */
export async function themeCssContent(template: Template): Promise<string> {
  if (isCustom(template)) {
    return generateThemeCss(parseTemplateConfig(template.yaml).config);
  }
  return fs.readFile(join(THEMES_DIR, getTemplate(template.id).css), "utf8");
}

export async function baseCssContent(): Promise<string> {
  return fs.readFile(join(THEMES_DIR, "base.css"), "utf8");
}
export async function printCssContent(): Promise<string> {
  return fs.readFile(join(THEMES_DIR, "print.css"), "utf8");
}

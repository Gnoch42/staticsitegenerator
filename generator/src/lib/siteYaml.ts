import { parse, stringify } from "yaml";
import type { FullSite } from "./queries";
import { buildContentYaml } from "./contentYaml";
import { buildSettingsYaml } from "./settingsYaml";
import { buildLocaleYaml } from "./locale";

// ─────────────────────────────────────────────────────────────
//  « Site complet » en un seul YAML, façon RenderCV : 4 clés de
//  premier niveau (cv / design / locale / settings). On réutilise
//  les sérialiseurs de chaque catégorie (round-trip identique) en
//  ré-imbriquant leur sortie, puis on stringifie l'ensemble.
// ─────────────────────────────────────────────────────────────

/** Base → YAML « site complet » (cv + design + locale + settings). */
export function buildSiteYaml(full: FullSite): string {
  const doc = {
    cv: parse(buildContentYaml(full)),
    design: full.template.yaml ? parse(full.template.yaml) : {},
    locale: parse(buildLocaleYaml(full.site.locale, full.site.languages)),
    settings: parse(buildSettingsYaml(full)),
  };
  return stringify(doc, { lineWidth: 0 });
}

export interface SiteYamlParts {
  cv?: unknown;
  design?: unknown;
  locale?: unknown;
  settings?: unknown;
}

/** Découpe le YAML « site complet » en ses 4 sous-parties (non validées). */
export function splitSiteYaml(text: string): {
  parts: SiteYamlParts | null;
  error: string | null;
} {
  let raw: unknown;
  try {
    raw = parse(text);
  } catch (e) {
    return { parts: null, error: e instanceof Error ? e.message : "YAML invalide" };
  }
  if (!raw || typeof raw !== "object") {
    return { parts: null, error: "Le YAML doit avoir des clés cv / design / locale / settings." };
  }
  const r = raw as Record<string, unknown>;
  const known = ["cv", "design", "locale", "settings"];
  const extra = Object.keys(r).filter((k) => !known.includes(k));
  if (extra.length) {
    return { parts: null, error: `Clés inconnues : ${extra.join(", ")} (attendu : ${known.join(", ")}).` };
  }
  return {
    parts: { cv: r.cv, design: r.design, locale: r.locale, settings: r.settings },
    error: null,
  };
}

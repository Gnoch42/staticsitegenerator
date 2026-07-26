import { parse, stringify } from "yaml";
import type { FullSite } from "./queries";
import {
  SECTIONS_BY_PAGE,
  isSectionAllowed,
  isInProfile,
  type PageType,
  type SectionType,
  type Multilingual,
} from "./types";

// ─────────────────────────────────────────────────────────────
//  Contenu du site en YAML (aller-retour avec la base).
//  Structure : page → sections (catégories) → items → textes.
//  La base reste la source de vérité ; ce module ne fait que
//  sérialiser (pour l'éditeur) et parser/valider (pour l'import).
// ─────────────────────────────────────────────────────────────

const PAGE_TYPES: PageType[] = ["home", "cv", "video", "research", "portfolio", "contact"];

export interface ParsedItem {
  data: Record<string, unknown>;
  profiles: string[]; // noms de profils
}
export interface ParsedSection {
  type: SectionType;
  title: Multilingual | null;
  items: ParsedItem[];
}
export interface ParsedContent {
  pages: { type: PageType; sections: ParsedSection[] }[];
}

/**
 * Base → YAML éditable (toutes les pages, dans l'ordre).
 * Si `profileId` est fourni (export filtré), ne garde que les items visibles
 * pour ce profil et retire les sections devenues vides.
 */
export function buildContentYaml(
  full: FullSite,
  profileId?: number | null,
): string {
  const nameById = new Map(full.profiles.map((p) => [p.id, p.name]));
  const filtered = profileId !== undefined && profileId !== null;
  const doc: Record<string, unknown> = {};

  for (const page of full.pages) {
    let secs = page.sections.map((s) => ({
      s,
      items: s.items.filter((it) =>
        isInProfile(it.profileIds, profileId ?? null),
      ),
    }));
    if (filtered) secs = secs.filter((x) => x.items.length > 0);

    doc[page.type] = secs.map(({ s, items }) => {
      const section: Record<string, unknown> = { section: s.type };
      if (s.title && Object.keys(s.title).length) section.title = s.title;
      section.items = items.map((it) => {
        const names = it.profileIds
          .map((id) => nameById.get(id))
          .filter((n): n is string => !!n);
        const out: Record<string, unknown> = { ...it.data };
        if (names.length) out.profiles = names;
        return out;
      });
      return section;
    });
  }

  return stringify(doc, { lineWidth: 0 });
}

/** YAML → contenu validé (ou message d'erreur). */
export function parseContentYaml(text: string): {
  content: ParsedContent | null;
  error: string | null;
} {
  let raw: unknown;
  try {
    raw = parse(text);
  } catch (e) {
    return { content: null, error: e instanceof Error ? e.message : "YAML invalide" };
  }
  if (!raw || typeof raw !== "object") {
    return { content: null, error: "Le YAML doit être un objet (clés de page)." };
  }

  const pages: ParsedContent["pages"] = [];
  for (const [key, val] of Object.entries(raw as Record<string, unknown>)) {
    if (!PAGE_TYPES.includes(key as PageType)) {
      return { content: null, error: `Page inconnue : "${key}" (attendu : ${PAGE_TYPES.join(", ")}).` };
    }
    const pageType = key as PageType;
    if (!Array.isArray(val)) {
      return { content: null, error: `"${key}" doit être une liste de sections.` };
    }
    const sections: ParsedSection[] = [];
    for (const [i, s] of val.entries()) {
      if (!s || typeof s !== "object") {
        return { content: null, error: `${key}[${i}] doit être un objet section.` };
      }
      const so = s as Record<string, unknown>;
      const type = so.section;
      if (typeof type !== "string" || !isSectionAllowed(pageType, type as SectionType)) {
        return {
          content: null,
          error: `${key}[${i}] : section "${type}" invalide. Autorisées : ${SECTIONS_BY_PAGE[pageType].join(", ")}.`,
        };
      }
      const title =
        so.title && typeof so.title === "object"
          ? (so.title as Multilingual)
          : null;
      const rawItems = Array.isArray(so.items) ? so.items : [];
      const items: ParsedItem[] = [];
      for (const [j, it] of rawItems.entries()) {
        if (!it || typeof it !== "object") {
          return { content: null, error: `${key}[${i}].items[${j}] doit être un objet.` };
        }
        const { profiles, ...data } = it as Record<string, unknown>;
        const profNames = Array.isArray(profiles) ? profiles.map(String) : [];
        items.push({ data, profiles: profNames });
      }
      sections.push({ type: type as SectionType, title, items });
    }
    pages.push({ type: pageType, sections });
  }

  return { content: { pages }, error: null };
}

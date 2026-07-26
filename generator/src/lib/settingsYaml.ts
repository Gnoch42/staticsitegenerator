import { parse, stringify } from "yaml";
import type { FullSite } from "./queries";

// ─────────────────────────────────────────────────────────────
//  Réglages du site en YAML (aller-retour avec la base).
//  La base reste la source de vérité ; ce module sérialise (pour
//  l'éditeur) et parse/valide (structure). La résolution des
//  références (template, profils) se fait à l'import (settingsImport).
// ─────────────────────────────────────────────────────────────

export interface ParsedSettings {
  templateId?: string;
  languages?: string[];
  defaultLanguage?: string;
  adminLanguage?: "fr" | "en";
  ownerName?: string | null;
  photoUrl?: string | null;
  photoProfiles?: string[]; // noms de profils (vide = toutes)
  activeProfile?: string | null; // nom, ou null = CV complet
  pages?: { type: string; enabled: boolean }[];
  profiles?: string[]; // noms, dans l'ordre
}

/** Base → YAML éditable des réglages. */
export function buildSettingsYaml(full: FullSite): string {
  const nameById = new Map(full.profiles.map((p) => [p.id, p.name]));
  const s = full.site;
  const doc: Record<string, unknown> = {
    template: s.templateId,
    languages: s.languages,
    default_language: s.defaultLanguage,
    admin_language: s.adminLanguage,
    owner_name: s.ownerName ?? "",
    photo: {
      url: s.photoUrl ?? "",
      profiles: (s.photoProfileIds ?? [])
        .map((id) => nameById.get(id))
        .filter((n): n is string => !!n),
    },
    active_profile: s.activeProfileId ? (nameById.get(s.activeProfileId) ?? "") : "",
    pages: full.pages.map((p) => ({ type: p.type, enabled: p.enabled })),
    profiles: full.profiles.map((p) => p.name),
  };
  return stringify(doc, { lineWidth: 0 });
}

/** YAML → réglages validés (structure). Champs absents = non modifiés. */
export function parseSettingsYaml(text: string): {
  settings: ParsedSettings | null;
  error: string | null;
} {
  let raw: unknown;
  try {
    raw = parse(text);
  } catch (e) {
    return { settings: null, error: e instanceof Error ? e.message : "YAML invalide" };
  }
  if (!raw || typeof raw !== "object") {
    return { settings: null, error: "Le YAML doit être un objet de réglages." };
  }
  const r = raw as Record<string, unknown>;
  const out: ParsedSettings = {};

  if (r.template !== undefined) {
    if (typeof r.template !== "string" || !r.template.trim()) {
      return { settings: null, error: "« template » doit être un identifiant non vide." };
    }
    out.templateId = r.template.trim();
  }

  if (r.languages !== undefined) {
    if (!Array.isArray(r.languages) || r.languages.some((x) => typeof x !== "string")) {
      return { settings: null, error: "« languages » doit être une liste de codes langue." };
    }
    const langs = (r.languages as string[]).map((x) => x.trim()).filter(Boolean);
    if (langs.length === 0) {
      return { settings: null, error: "« languages » ne peut pas être vide." };
    }
    out.languages = langs;
  }

  if (r.default_language !== undefined) {
    if (typeof r.default_language !== "string") {
      return { settings: null, error: "« default_language » doit être une chaîne." };
    }
    out.defaultLanguage = r.default_language.trim();
  }

  if (r.admin_language !== undefined) {
    const al = r.admin_language;
    if (al !== "fr" && al !== "en") {
      return { settings: null, error: "« admin_language » doit être « fr » ou « en »." };
    }
    out.adminLanguage = al;
  }

  if (r.owner_name !== undefined) {
    out.ownerName = typeof r.owner_name === "string" && r.owner_name.trim()
      ? r.owner_name.trim()
      : null;
  }

  if (r.photo !== undefined) {
    if (!r.photo || typeof r.photo !== "object") {
      return { settings: null, error: "« photo » doit être un objet { url, profiles }." };
    }
    const p = r.photo as Record<string, unknown>;
    if (p.url !== undefined) {
      out.photoUrl = typeof p.url === "string" && p.url.trim() ? p.url.trim() : null;
    }
    if (p.profiles !== undefined) {
      if (!Array.isArray(p.profiles)) {
        return { settings: null, error: "« photo.profiles » doit être une liste de noms." };
      }
      out.photoProfiles = (p.profiles as unknown[]).map(String);
    }
  }

  if (r.active_profile !== undefined) {
    out.activeProfile =
      typeof r.active_profile === "string" && r.active_profile.trim()
        ? r.active_profile.trim()
        : null;
  }

  if (r.pages !== undefined) {
    if (!Array.isArray(r.pages)) {
      return { settings: null, error: "« pages » doit être une liste { type, enabled }." };
    }
    const pages: { type: string; enabled: boolean }[] = [];
    for (const [i, p] of (r.pages as unknown[]).entries()) {
      if (!p || typeof p !== "object") {
        return { settings: null, error: `pages[${i}] doit être un objet { type, enabled }.` };
      }
      const po = p as Record<string, unknown>;
      if (typeof po.type !== "string") {
        return { settings: null, error: `pages[${i}].type manquant.` };
      }
      pages.push({ type: po.type, enabled: po.enabled !== false });
    }
    out.pages = pages;
  }

  if (r.profiles !== undefined) {
    if (!Array.isArray(r.profiles)) {
      return { settings: null, error: "« profiles » doit être une liste de noms." };
    }
    out.profiles = (r.profiles as unknown[]).map(String).map((s) => s.trim()).filter(Boolean);
  }

  return { settings: out, error: null };
}

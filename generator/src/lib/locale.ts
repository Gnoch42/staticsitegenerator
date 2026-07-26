import { parse, stringify } from "yaml";
import type { Multilingual } from "./types";

// ─────────────────────────────────────────────────────────────
//  Locale : noms de mois + format de date, par langue.
//  (catégorie YAML « locale » du modèle RenderCV, restreinte —
//  par choix — aux mois et au format de date. Le mot « en cours »
//  vit dans le template, pas ici.)
//  La base reste la source de vérité (colonne JSON site.locale) ;
//  `null` = utiliser les valeurs par défaut ci-dessous.
// ─────────────────────────────────────────────────────────────

export interface LangLocale {
  /** 12 noms de mois longs (index 0 = janvier). */
  months: string[];
  /** 12 noms de mois courts. */
  monthsShort: string[];
  /** Patron de date. Jetons : YYYY, MM, MMM (court), MMMM (long). */
  dateFormat: string;
  /** Séparateur entre début et fin d'une plage. */
  dateSeparator: string;
}
export type LocaleConfig = Record<string, LangLocale>;

const FR: LangLocale = {
  months: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
  monthsShort: ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juill.", "août", "sept.", "oct.", "nov.", "déc."],
  dateFormat: "MM-YYYY",
  dateSeparator: " – ",
};
const EN: LangLocale = {
  months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  dateFormat: "YYYY-MM",
  dateSeparator: " – ",
};
const ES: LangLocale = {
  months: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
  monthsShort: ["ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "sept.", "oct.", "nov.", "dic."],
  dateFormat: "MM-YYYY",
  dateSeparator: " – ",
};
const DE: LangLocale = {
  months: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
  monthsShort: ["Jan.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sept.", "Okt.", "Nov.", "Dez."],
  dateFormat: "MM-YYYY",
  dateSeparator: " – ",
};

export const DEFAULT_LOCALES: LocaleConfig = { fr: FR, en: EN, es: ES, de: DE };

/** Mot par défaut pour une date de fin ouverte (surchargeable par template). */
export const DEFAULT_ONGOING: Multilingual = {
  fr: "présent",
  en: "present",
  es: "presente",
  de: "heute",
};

/** Locale effective pour une langue (config utilisateur → défaut → anglais). */
export function localeFor(
  config: LocaleConfig | null | undefined,
  lang: string,
): LangLocale {
  return (config && config[lang]) || DEFAULT_LOCALES[lang] || EN;
}

/**
 * Formate une date « YYYY-MM » (ou « YYYY » seule) selon le patron.
 * Texte libre (autre format) : renvoyé tel quel.
 */
export function formatDate(s: string, loc: LangLocale): string {
  const ym = s.match(/^(\d{4})-(\d{2})$/);
  if (ym) {
    const [, y, moStr] = ym;
    const mo = parseInt(moStr, 10);
    return loc.dateFormat
      .replace(/MMMM/g, loc.months[mo - 1] ?? moStr)
      .replace(/MMM/g, loc.monthsShort[mo - 1] ?? moStr)
      .replace(/MM/g, moStr)
      .replace(/YYYY/g, y);
  }
  const yOnly = s.match(/^(\d{4})$/);
  if (yOnly) return yOnly[1];
  return s;
}

/**
 * Plage de dates. Fin vide + début présent → « début – <en cours> ».
 * Passer `ongoing` vide désactive le mot « en cours ».
 */
export function formatDateRange(
  start: string,
  end: string,
  loc: LangLocale,
  ongoing: string,
): string {
  const s = start ? formatDate(start, loc) : "";
  if (start && !end) {
    return ongoing ? `${s}${loc.dateSeparator}${ongoing}` : s;
  }
  const e = end ? formatDate(end, loc) : "";
  return [s, e].filter(Boolean).join(loc.dateSeparator);
}

// ── Aller-retour YAML ──────────────────────────────────────────

/** Config locale → YAML éditable (une entrée par langue configurée). */
export function buildLocaleYaml(
  config: LocaleConfig | null | undefined,
  languages: string[],
): string {
  const langs: Record<string, unknown> = {};
  for (const lang of languages) {
    const l = localeFor(config, lang);
    langs[lang] = {
      months: l.months,
      months_short: l.monthsShort,
      date_format: l.dateFormat,
      date_separator: l.dateSeparator,
    };
  }
  return stringify({ languages: langs }, { lineWidth: 0 });
}

/** YAML → config locale validée (valeurs manquantes complétées par défaut). */
export function parseLocaleYaml(text: string): {
  locale: LocaleConfig | null;
  error: string | null;
} {
  let raw: unknown;
  try {
    raw = parse(text);
  } catch (e) {
    return { locale: null, error: e instanceof Error ? e.message : "YAML invalide" };
  }
  if (!raw || typeof raw !== "object") {
    return { locale: null, error: "Le YAML doit être un objet avec une clé « languages »." };
  }
  const langsObj = (raw as Record<string, unknown>).languages;
  if (!langsObj || typeof langsObj !== "object") {
    return { locale: null, error: "Clé « languages » manquante (objet langue → réglages)." };
  }

  const out: LocaleConfig = {};
  for (const [lang, val] of Object.entries(langsObj as Record<string, unknown>)) {
    if (!val || typeof val !== "object") {
      return { locale: null, error: `languages.${lang} doit être un objet.` };
    }
    const v = val as Record<string, unknown>;
    const def = DEFAULT_LOCALES[lang] || EN;
    const arr12 = (x: unknown, fallback: string[], field: string): string[] | { err: string } => {
      if (x === undefined) return fallback;
      if (!Array.isArray(x) || x.length !== 12) {
        return { err: `languages.${lang}.${field} doit être une liste de 12 mois.` };
      }
      return x.map(String);
    };
    const months = arr12(v.months, def.months, "months");
    if ("err" in (months as object)) return { locale: null, error: (months as { err: string }).err };
    const monthsShort = arr12(v.months_short, def.monthsShort, "months_short");
    if ("err" in (monthsShort as object)) return { locale: null, error: (monthsShort as { err: string }).err };
    out[lang] = {
      months: months as string[],
      monthsShort: monthsShort as string[],
      dateFormat: typeof v.date_format === "string" ? v.date_format : def.dateFormat,
      dateSeparator: typeof v.date_separator === "string" ? v.date_separator : def.dateSeparator,
    };
  }
  return { locale: out, error: null };
}

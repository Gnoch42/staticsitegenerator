import type { Multilingual } from "./types";

export const PAGE_LABELS: Record<string, Multilingual> = {
  cv: { fr: "CV", en: "CV" },
  video: { fr: "Vidéo", en: "Video" },
  research: { fr: "Publications", en: "Publications" },
  portfolio: { fr: "Portfolio", en: "Portfolio" },
  contact: { fr: "Contact", en: "Contact" },
};

/** Résout un champ multilingue avec repli sur la langue par défaut. */
export function t(
  field: Multilingual | null | undefined,
  lang: string,
  fallbackLang?: string,
): string {
  if (!field) return "";
  if (field[lang]) return field[lang];
  if (fallbackLang && field[fallbackLang]) return field[fallbackLang];
  const first = Object.values(field).find(Boolean);
  return first ?? "";
}

export const LANG_NAMES: Record<string, string> = {
  fr: "Français",
  en: "English",
};

// ─────────────────────────────────────────────────────────────
//  Types partagés : modèle de données, sections valides par page.
//  Le backend ne connaît que ce modèle générique ; les templates
//  ne font qu'interpréter ces mêmes structures visuellement.
// ─────────────────────────────────────────────────────────────

/** Champ multilingue : { "fr": "…", "en": "…" }. */
export type Multilingual = Record<string, string>;

export type PageType = "cv" | "video" | "research" | "portfolio" | "contact";

/** Visibilité d'une section/d'un item selon le support de rendu. */
export type Visibility = "both" | "online" | "print";

/** Un élément avec cette visibilité doit-il apparaître dans ce mode de rendu ? */
export function isVisibleIn(
  visibility: Visibility | null | undefined,
  mode: "online" | "print",
): boolean {
  const v = visibility ?? "both";
  return v === "both" || v === mode;
}

/**
 * Un item doit-il apparaître pour le profil actif ?
 * Règle validée : un item SANS profil associé est "toujours inclus" ; sinon
 * il n'apparaît que s'il est associé au profil actif. `activeProfileId = null`
 * = CV complet (tous les items).
 */
export function isInProfile(
  itemProfileIds: number[],
  activeProfileId: number | null,
): boolean {
  if (activeProfileId == null) return true;
  if (itemProfileIds.length === 0) return true;
  return itemProfileIds.includes(activeProfileId);
}

export type SectionType =
  // page cv
  | "contact"
  | "summary"
  | "experience"
  | "involvement"
  | "education"
  | "skills"
  | "distinctions"
  | "hobbies"
  | "custom"
  // page video
  | "video_embed"
  // page research
  | "publication_list"
  // page portfolio
  | "portfolio_gallery"
  // page contact
  | "contact_links";

/** Sections autorisées par type de page (validation applicative). */
export const SECTIONS_BY_PAGE: Record<PageType, SectionType[]> = {
  cv: [
    "contact",
    "summary",
    "experience",
    "involvement",
    "education",
    "skills",
    "distinctions",
    "hobbies",
    "custom",
  ],
  video: ["video_embed"],
  research: ["publication_list"],
  portfolio: ["portfolio_gallery"],
  contact: ["contact_links"],
};

/** Une section est-elle valide pour un type de page donné ? */
export function isSectionAllowed(page: PageType, section: SectionType): boolean {
  return SECTIONS_BY_PAGE[page]?.includes(section) ?? false;
}

// ── Structures `data` par type d'item (indicatives ; JSON libre) ──

export interface ExperienceData {
  [lang: string]:
    | {
        title?: string;
        organization?: string;
        location?: string;
        start_date?: string;
        end_date?: string;
        description?: string;
      }
    | undefined;
}

export interface SkillData {
  [lang: string]: { category?: string; value?: string } | undefined;
}

export interface ContactLinkData {
  kind: string; // "email" | "phone" | "linkedin" | "github" | "website" | …
  label: Multilingual;
  value: string;
}

export interface PublicationData {
  [lang: string]: { title?: string; venue?: string; abstract?: string } | undefined;
  // champs non-multilingues coexistent dans le même objet :
  // year?: number; authors?: string; link?: string;
}

export interface VideoEmbedData {
  provider: string; // "youtube" | "vimeo" | …
  url: string;
  caption: Multilingual;
}

/** `data` est volontairement permissif : structure libre selon le type. */
export type ItemData = Record<string, unknown>;

// ── Métadonnées d'affichage des sections (labels admin) ──
export const SECTION_LABELS: Record<SectionType, Multilingual> = {
  contact: { fr: "Coordonnées", en: "Contact" },
  summary: { fr: "Résumé", en: "Summary" },
  experience: { fr: "Expériences", en: "Experience" },
  involvement: { fr: "Implications", en: "Involvement" },
  education: { fr: "Éducation", en: "Education" },
  skills: { fr: "Compétences", en: "Skills" },
  distinctions: { fr: "Distinctions", en: "Distinctions" },
  hobbies: { fr: "Loisirs", en: "Hobbies" },
  custom: { fr: "Section personnalisée", en: "Custom section" },
  video_embed: { fr: "Vidéo", en: "Video" },
  publication_list: { fr: "Publications", en: "Publications" },
  portfolio_gallery: { fr: "Galerie", en: "Gallery" },
  contact_links: { fr: "Liens de contact", en: "Contact links" },
};

/** Sections où les items sont des "coordonnées" simples (sidebar courte). */
export const SIDEBAR_SECTIONS: SectionType[] = [
  "contact",
  "skills",
  "distinctions",
  "hobbies",
];

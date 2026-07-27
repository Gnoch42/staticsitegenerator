import { parse } from "yaml";
import type { Multilingual } from "./types";

// ─────────────────────────────────────────────────────────────
//  Templates configurables en YAML : style + mise en page (dont
//  multi-colonnes). Le YAML est converti en config typée, puis en
//  variables/règles CSS scopées à `.theme-yaml`. Le rendu des
//  entrées reste géré par l'app (renderers structurés).
// ─────────────────────────────────────────────────────────────

/** Éléments de rendu stylables individuellement (police, taille, etc.). */
export type ElementKey =
  | "name"
  | "section_title"
  | "job_title"
  | "organization"
  | "dates"
  | "summary"
  | "description"
  | "skill_category"
  | "skill_level"
  | "contact"
  | "tag"
  | "publication_title"
  | "publication_authors"
  | "publication_venue"
  | "publication_abstract";

/** Style typographique d'un élément (toutes les propriétés optionnelles). */
export interface ElementStyle {
  font?: string; // famille de police
  size?: string; // ex. 1.1rem, 11pt
  weight?: string; // 400 | 600 | 700 | bold…
  style?: "normal" | "italic";
  color?: string; // hex, ou jeton fg | muted | accent | border
  uppercase?: boolean;
  letterSpacing?: string;
}

/** Classes CSS ciblées par chaque élément (scopées `.theme-yaml`). */
export const ELEMENT_SELECTORS: Record<ElementKey, string[]> = {
  name: [".cv-name"],
  section_title: [".sec-title"],
  job_title: [".ti-title"],
  organization: [".ti-meta"],
  dates: [".ti-dates", ".pub-year"],
  summary: [".block-text", ".block-heading"],
  description: [".ti-desc"],
  skill_category: [".skill-cat"],
  skill_level: [".skill-level"],
  contact: [".contact-item"],
  tag: [".tag"],
  publication_title: [".pub-title"],
  publication_authors: [".pub-authors"],
  publication_venue: [".pub-venue"],
  publication_abstract: [".pub-abstract"],
};

export interface TemplateConfig {
  layout: {
    type: "single-column" | "two-column";
    sidebar: string[]; // types de sections en colonne latérale
    sidebarSide: "left" | "right";
    sidebarWidth: string;
    maxWidth: string;
  };
  page: { size: "a4" | "us-letter" };
  /** Buffers / espacements (écran ET PDF). */
  spacing: {
    pageMargin: string; // marge autour de la page (PDF)
    columnGap: string; // entre la sidebar et la colonne principale
    sidebarPadding: string; // marge intérieure du panneau latéral
    sectionGap: string; // entre les sections
    itemGap: string; // entre les items (expériences, publications…)
  };
  colors: {
    bg: string;
    body: string;
    accent: string;
    muted: string;
    border: string;
    surface: string;
    sidebarBg: string | null;
    sidebarFg: string | null;
  };
  typography: {
    fontBody: string;
    fontHeadings: string;
    baseSize: string;
    lineHeight: string;
    alignment: "left" | "justified";
    sectionTitleStyle: "plain" | "underline" | "rule" | "small-caps";
    /** Style par élément ; complète les défauts de base.css. */
    elements: Record<ElementKey, ElementStyle>;
  };
  header: {
    photo: boolean;
    photoSize: string;
    photoShape: "circle" | "square" | "rounded";
  };
  bullets: { marker: string };
  contact: { showIcons: boolean };
  /** Afficher/masquer des éléments du rendu (par template). */
  display: {
    sectionTitles: boolean;
    contactLabels: boolean;
    dates: boolean;
    organizations: boolean;
    descriptions: boolean;
    skillCategories: boolean;
    skillLevels: boolean;
    publicationAbstracts: boolean;
    /** true = niveau de compétence sur sa propre ligne (sous la compétence). */
    skillLevelOwnLine: boolean;
  };
  /** Libellés du rendu propres au template (pas de style / CSS). */
  labels: {
    /** Mot pour une date de fin ouverte (par langue). Vide = comportement défaut. */
    ongoing: Multilingual;
  };
  /** CSS libre ajouté à la fin (scopé `.theme-yaml`) — échappatoire pour
   *  tout ce que les options ne couvrent pas (en-têtes, compteurs, etc.). */
  customCss: string;
}

export const DEFAULT_CONFIG: TemplateConfig = {
  layout: {
    type: "single-column",
    sidebar: ["contact", "skills", "distinctions", "hobbies"],
    sidebarSide: "left",
    sidebarWidth: "34%",
    maxWidth: "900px",
  },
  page: { size: "a4" },
  spacing: {
    pageMargin: "16mm",
    columnGap: "2.5rem",
    sidebarPadding: "1.25rem",
    sectionGap: "2rem",
    itemGap: "1.25rem",
  },
  colors: {
    bg: "#ffffff",
    body: "#1a1a1a",
    accent: "#2563eb",
    muted: "#6b7280",
    border: "#e5e7eb",
    surface: "#f9fafb",
    sidebarBg: null,
    sidebarFg: null,
  },
  typography: {
    fontBody: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    fontHeadings: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    baseSize: "16px",
    lineHeight: "1.55",
    alignment: "left",
    sectionTitleStyle: "underline",
    elements: emptyElements(),
  },
  header: { photo: true, photoSize: "110px", photoShape: "circle" },
  bullets: { marker: "-" },
  contact: { showIcons: true },
  display: {
    sectionTitles: true,
    contactLabels: true,
    dates: true,
    organizations: true,
    descriptions: true,
    skillCategories: true,
    skillLevels: true,
    publicationAbstracts: true,
    skillLevelOwnLine: false,
  },
  labels: { ongoing: {} },
  customCss: "",
};

/** YAML de départ proposé à la création d'un template (modèle complet). */
export const STARTER_YAML = `name: Mon template
layout:
  type: two-column          # single-column | two-column
  sidebar: [contact, skills, distinctions, hobbies]
  sidebar_side: left        # left | right
  sidebar_width: 32%        # % conseillé (constant écran/impression ; un px paraît large en A4)
  max_width: 1000px
page:
  size: us-letter           # a4 | us-letter
spacing:                    # buffers (écran ET PDF)
  page_margin: 16mm         # marge autour de la page (PDF)
  column_gap: 6%            # entre la colonne latérale et la principale
  sidebar_padding: 1.25rem  # marge intérieure du panneau latéral
  section_gap: 1.5rem       # entre les sections
  item_gap: 1rem            # entre les items (expériences, publications…)
colors:
  accent: "#004f90"
  # sidebar_bg: "#0f172a"
  # sidebar_fg: "#e2e8f0"
typography:
  font_body: "Inter, system-ui, sans-serif"
  font_headings: "Inter, system-ui, sans-serif"
  base_size: 16px
  line_height: 1.55
  alignment: left           # left | justified
  # Style par élément. Propriétés (toutes optionnelles) :
  #   font, size, weight (400/600/700), style (normal|italic),
  #   color (hex ou jeton fg|muted|accent|border), uppercase, letter_spacing
  elements:
    name:          { size: 1.7rem, weight: 700 }
    section_title: { size: 1.1rem, uppercase: true, color: accent, style: rule }  # style: plain|underline|rule|small-caps
    job_title:     { size: 1rem, weight: 600 }
    organization:  { size: .9rem, color: muted }
    dates:         { size: .85rem, color: muted }
    summary:       { size: 1rem }        # résumé / blocs de texte
    description:   { size: 1rem }        # descriptions d'expériences
    skill_category:{ weight: 600 }
    skill_level:   { color: muted }
    contact:       { size: 1rem }
    tag:           { size: .85rem }
    publication_title:    { size: 1rem, weight: 600 }
    publication_authors:  { size: .9rem }
    publication_venue:    { size: .9rem, color: muted, style: italic }
    publication_abstract: { size: .95rem }
header:
  photo: true
  photo_size: 120px
  photo_shape: circle       # circle | square | rounded
bullets:
  marker: "•"               # "" pour masquer les tirets
contact:
  show_icons: true
display:                    # afficher/masquer des éléments (true = affiché)
  section_titles: true
  contact_labels: true      # false = seulement l'icône + la valeur
  dates: true
  organizations: true       # organisation · lieu
  descriptions: true
  skill_categories: true
  skill_levels: true
  skill_level_own_line: false   # true = niveau sous la compétence
  publication_abstracts: true
labels:                     # libellés du rendu (par langue)
  ongoing:                  # mot pour une date de fin ouverte
    fr: présent
    en: present
# CSS libre pour tout le reste (scopé .theme-yaml) :
# custom_css: |
#   .theme-yaml .site-header { border-bottom: 2px solid var(--accent); }
`;

// ── Parsing YAML → config typée (tolérant : remplit les défauts) ──
export function parseTemplateConfig(yamlText: string | null | undefined): {
  config: TemplateConfig;
  name: string | null;
  error: string | null;
} {
  const d = DEFAULT_CONFIG;
  if (!yamlText || !yamlText.trim()) {
    return { config: clone(d), name: null, error: null };
  }
  let raw: Record<string, unknown>;
  try {
    raw = (parse(yamlText) as Record<string, unknown>) ?? {};
  } catch (e) {
    return {
      config: clone(d),
      name: null,
      error: e instanceof Error ? e.message : "YAML invalide",
    };
  }

  const layout = obj(raw.layout);
  const page = obj(raw.page);
  const spacing = obj(raw.spacing);
  const colors = obj(raw.colors);
  const typo = obj(raw.typography);
  const sectionTitles = obj(typo.section_titles);
  const elemRaw = obj(typo.elements);
  const header = obj(raw.header);
  const bullets = obj(raw.bullets);
  const contact = obj(raw.contact);
  const display = obj(raw.display);

  // Style par élément + rétrocompatibilité (anciennes clés name_size /
  // section_title_size / section_titles.uppercase repliées dans `elements`).
  const elements = emptyElements();
  for (const key of Object.keys(ELEMENT_SELECTORS) as ElementKey[]) {
    elements[key] = elementStyle(elemRaw[key]);
  }
  if (!elements.name.size && typo.name_size)
    elements.name.size = String(typo.name_size);
  if (!elements.section_title.size && typo.section_title_size)
    elements.section_title.size = String(typo.section_title_size);
  if (elements.section_title.uppercase === undefined && sectionTitles.uppercase !== undefined)
    elements.section_title.uppercase = bool(sectionTitles.uppercase, true);

  const config: TemplateConfig = {
    layout: {
      type: enumVal(layout.type, ["single-column", "two-column"], d.layout.type),
      sidebar: Array.isArray(layout.sidebar)
        ? (layout.sidebar as unknown[]).map(String)
        : d.layout.sidebar,
      sidebarSide: enumVal(layout.sidebar_side, ["left", "right"], d.layout.sidebarSide),
      sidebarWidth: str(layout.sidebar_width, d.layout.sidebarWidth),
      maxWidth: str(layout.max_width, d.layout.maxWidth),
    },
    page: {
      size: enumVal(page.size, ["a4", "us-letter"], d.page.size),
    },
    spacing: {
      // Rétrocompat : page.margin et layout.column_gap continuent de marcher.
      pageMargin: str(spacing.page_margin, str(page.margin, d.spacing.pageMargin)),
      columnGap: str(spacing.column_gap, str(layout.column_gap, d.spacing.columnGap)),
      sidebarPadding: str(spacing.sidebar_padding, d.spacing.sidebarPadding),
      sectionGap: str(spacing.section_gap, d.spacing.sectionGap),
      itemGap: str(spacing.item_gap, d.spacing.itemGap),
    },
    colors: {
      bg: str(colors.bg, d.colors.bg),
      body: str(colors.body, d.colors.body),
      accent: str(colors.accent, d.colors.accent),
      muted: str(colors.muted, d.colors.muted),
      border: str(colors.border, d.colors.border),
      surface: str(colors.surface, d.colors.surface),
      sidebarBg: colors.sidebar_bg != null ? String(colors.sidebar_bg) : null,
      sidebarFg: colors.sidebar_fg != null ? String(colors.sidebar_fg) : null,
    },
    typography: {
      fontBody: str(typo.font_body, d.typography.fontBody),
      fontHeadings: str(typo.font_headings, str(typo.font_body, d.typography.fontHeadings)),
      baseSize: str(typo.base_size, d.typography.baseSize),
      lineHeight: str(typo.line_height, d.typography.lineHeight),
      alignment: enumVal(typo.alignment, ["left", "justified"], d.typography.alignment),
      sectionTitleStyle: enumVal(
        // `style` accepté sous elements.section_title OU l'ancien section_titles.
        (elemRaw.section_title as Record<string, unknown> | undefined)?.style ??
          sectionTitles.style,
        ["plain", "underline", "rule", "small-caps"],
        d.typography.sectionTitleStyle,
      ),
      elements,
    },
    header: {
      photo: bool(header.photo, d.header.photo),
      photoSize: str(header.photo_size, d.header.photoSize),
      photoShape: enumVal(header.photo_shape, ["circle", "square", "rounded"], d.header.photoShape),
    },
    // marker peut être "" (masquer) → on n'utilise pas str() qui rejette le vide
    bullets: {
      marker:
        typeof bullets.marker === "string" ? bullets.marker : d.bullets.marker,
    },
    contact: { showIcons: bool(contact.show_icons, d.contact.showIcons) },
    display: {
      sectionTitles: bool(display.section_titles, d.display.sectionTitles),
      contactLabels: bool(display.contact_labels, d.display.contactLabels),
      dates: bool(display.dates, d.display.dates),
      organizations: bool(display.organizations, d.display.organizations),
      descriptions: bool(display.descriptions, d.display.descriptions),
      skillCategories: bool(display.skill_categories, d.display.skillCategories),
      skillLevels: bool(display.skill_levels, d.display.skillLevels),
      publicationAbstracts: bool(
        display.publication_abstracts,
        d.display.publicationAbstracts,
      ),
      skillLevelOwnLine: bool(
        display.skill_level_own_line,
        d.display.skillLevelOwnLine,
      ),
    },
    labels: { ongoing: multilingual(obj(raw.labels).ongoing) },
    customCss: typeof raw.custom_css === "string" ? raw.custom_css : "",
  };

  const name = typeof raw.name === "string" ? raw.name : null;
  return { config, name, error: null };
}

// ── Génération du CSS scopé à `.theme-yaml` ──
export function generateThemeCss(config: TemplateConfig): string {
  const c = config;
  const shape =
    c.header.photoShape === "circle"
      ? "50%"
      : c.header.photoShape === "rounded"
        ? "12px"
        : "0";

  // Colonnes : ordre DOM géré par le composant (sidebar avant/après main).
  const cols =
    c.layout.sidebarSide === "left"
      ? `${c.layout.sidebarWidth} 1fr`
      : `1fr ${c.layout.sidebarWidth}`;

  const rules: string[] = [];

  rules.push(`.theme-yaml{
  --bg:${c.colors.bg}; --fg:${c.colors.body}; --accent:${c.colors.accent};
  --muted:${c.colors.muted}; --border:${c.colors.border}; --surface:${c.colors.surface};
  --maxw:${c.layout.maxWidth};
  --font-body:${c.typography.fontBody}; --font-head:${c.typography.fontHeadings};
  font-size:${c.typography.baseSize}; line-height:${c.typography.lineHeight};
}`);

  rules.push(
    `.theme-yaml .cv-photo{width:${c.header.photoSize};height:${c.header.photoSize};border-radius:${shape};}`,
  );
  if (!c.header.photo) rules.push(`.theme-yaml .cv-photo{display:none;}`);

  // ── Espacements / buffers (écran ET PDF) ──
  rules.push(`.theme-yaml .sec{margin-bottom:${c.spacing.sectionGap};}`);
  rules.push(
    `.theme-yaml .timeline-item,.theme-yaml .pub-item{margin-bottom:${c.spacing.itemGap};}`,
  );

  // ── Titres de section : décoration (style) + typo (elements.section_title) ──
  const smallCaps = c.typography.sectionTitleStyle === "small-caps";
  const st: string[] = [];
  if (c.typography.sectionTitleStyle === "plain") st.push("border:none;");
  if (c.typography.sectionTitleStyle === "underline")
    st.push("border-bottom:1px solid var(--border);");
  if (c.typography.sectionTitleStyle === "rule")
    st.push("border:none;border-top:3px solid var(--accent);padding-top:.35rem;");
  if (smallCaps)
    st.push("border:none;font-variant:small-caps;text-transform:none;letter-spacing:0;");
  // Propriétés typographiques de l'élément (uppercase ignoré si small-caps).
  st.push(elementDecls(c.typography.elements.section_title, { skipUppercase: smallCaps }));
  rules.push(`.theme-yaml .sec-title{${st.join("")}}`);

  // ── Typographie par élément (name, job_title, dates, body, etc.) ──
  for (const key of Object.keys(ELEMENT_SELECTORS) as ElementKey[]) {
    if (key === "section_title") continue; // déjà géré ci-dessus
    const decls = elementDecls(c.typography.elements[key]);
    if (!decls) continue;
    const sel = ELEMENT_SELECTORS[key].map((s) => `.theme-yaml ${s}`).join(",");
    rules.push(`${sel}{${decls}}`);
  }

  // Alignement du texte
  if (c.typography.alignment === "justified") {
    rules.push(
      `.theme-yaml .ti-desc,.theme-yaml .block-text,.theme-yaml .pub-abstract{text-align:justify;}`,
    );
  }

  // Puces / tirets
  if (c.bullets.marker === "") {
    rules.push(`.theme-yaml .li-dash{display:none;}`);
  } else if (c.bullets.marker !== "-") {
    rules.push(
      `.theme-yaml .li-dash{font-size:0;}.theme-yaml .li-dash::after{content:"${c.bullets.marker}";font-size:1rem;color:var(--accent);}`,
    );
  }

  // Icônes de contact
  if (!c.contact.showIcons) rules.push(`.theme-yaml .contact-icon{display:none;}`);

  // Afficher/masquer des éléments (display:) — un false = masqué.
  const hide = (show: boolean, selector: string) => {
    if (!show) rules.push(`.theme-yaml ${selector}{display:none;}`);
  };
  hide(c.display.sectionTitles, ".sec-title");
  hide(c.display.contactLabels, ".contact-label");
  hide(c.display.dates, ".ti-dates");
  hide(c.display.organizations, ".ti-meta");
  hide(c.display.descriptions, ".ti-desc");
  hide(c.display.skillCategories, ".skill-cat");
  hide(c.display.skillLevels, ".skill-level");
  hide(c.display.publicationAbstracts, ".pub-abstract");
  // Niveau de compétence sur sa propre ligne (sous la compétence).
  if (c.display.skillLevelOwnLine) {
    rules.push(
      `.theme-yaml .skill-level{display:block;}.theme-yaml .skill-level::before{content:none;}`,
    );
  }

  // Mise en page deux colonnes (la sidebar est toujours en 1er dans le DOM)
  if (c.layout.type === "two-column") {
    const right = c.layout.sidebarSide === "right";
    // ÉCRAN : grille. min-width:0 empêche les liens longs de déborder d'une
    // colonne sur l'autre.
    rules.push(
      `.theme-yaml .two-col{display:grid;grid-template-columns:${cols};gap:${c.spacing.columnGap};align-items:start;}`,
    );
    rules.push(`.theme-yaml .col-sidebar,.theme-yaml .col-main{min-width:0;}`);
    if (right) {
      rules.push(
        `.theme-yaml .col-sidebar{grid-column:2;}.theme-yaml .col-main{grid-column:1;grid-row:1;}`,
      );
    }
    if (c.colors.sidebarBg) {
      rules.push(
        `.theme-yaml .col-sidebar{background:${c.colors.sidebarBg};color:${c.colors.sidebarFg ?? "inherit"};padding:${c.spacing.sidebarPadding};border-radius:var(--radius);}`,
      );
      if (c.colors.sidebarFg) {
        rules.push(
          `.theme-yaml .col-sidebar .sec-title,.theme-yaml .col-sidebar .contact-label,.theme-yaml .col-sidebar .muted{color:${c.colors.sidebarFg};opacity:.85;}`,
        );
      }
    }
    // IMPRESSION : ni la grille ni un fond de conteneur ne s'étirent en panneau
    // pleine hauteur à travers les sauts de page (le fond s'arrête là où le
    // contenu de la colonne s'arrête → blanc en bas quand un item insécable
    // passe à la page suivante). Solution robuste : peindre le panneau via un
    // pseudo-élément `position:fixed`, que Chromium répète sur CHAQUE page à
    // pleine hauteur, indépendamment du flux. Le contenu principal reste bloqué
    // dans sa colonne de droite via une marge ; la sidebar (flottante) pose son
    // texte par-dessus la bande.
    const floatDir = right ? "right" : "left";
    const mainMargin = right ? "margin-right" : "margin-left";
    const bandSide = right ? "right" : "left";
    rules.push(
      `@media print{` +
        (c.colors.sidebarBg
          ? `.theme-yaml .col-sidebar::before{content:"";position:fixed;top:0;bottom:0;${bandSide}:0;width:${c.layout.sidebarWidth};background:${c.colors.sidebarBg};z-index:-1;}`
          : "") +
        `.theme-yaml .two-col{display:block;}` +
        `.theme-yaml .col-sidebar{float:${floatDir};width:${c.layout.sidebarWidth};grid-column:auto;border-radius:0;background:transparent;position:relative;}` +
        `.theme-yaml .col-main{grid-column:auto;${mainMargin}:calc(${c.layout.sidebarWidth} + ${c.spacing.columnGap});}` +
        `}`,
    );
    rules.push(
      `@media screen and (max-width:760px){.theme-yaml .two-col{grid-template-columns:1fr;}}`,
    );
  }

  // CSS libre (échappatoire) ajouté en dernier pour pouvoir tout surcharger.
  if (c.customCss.trim()) rules.push(`/* custom_css */\n${c.customCss}`);

  return rules.join("\n");
}

/** Format de page Playwright + marge, pour l'export PDF. */
export function pdfPageOptions(config: TemplateConfig): {
  format: "A4" | "Letter";
  margin: string;
} {
  return {
    format: config.page.size === "us-letter" ? "Letter" : "A4",
    margin: config.spacing.pageMargin,
  };
}

// ── helpers ──
function obj(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}
function str(v: unknown, def: string): string {
  return typeof v === "string" && v.trim() ? v : typeof v === "number" ? String(v) : def;
}
function bool(v: unknown, def: boolean): boolean {
  return typeof v === "boolean" ? v : def;
}
function enumVal<T extends string>(v: unknown, allowed: T[], def: T): T {
  return typeof v === "string" && (allowed as string[]).includes(v) ? (v as T) : def;
}
function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}
/** Map d'éléments vides (toutes les clés présentes, styles vides). */
function emptyElements(): Record<ElementKey, ElementStyle> {
  const out = {} as Record<ElementKey, ElementStyle>;
  for (const key of Object.keys(ELEMENT_SELECTORS) as ElementKey[]) out[key] = {};
  return out;
}
/** Parse un style d'élément depuis le YAML (tolérant). */
function elementStyle(v: unknown): ElementStyle {
  const o = obj(v);
  const s: ElementStyle = {};
  if (typeof o.font === "string" && o.font.trim()) s.font = o.font;
  if (typeof o.size === "string" && o.size.trim()) s.size = o.size;
  if (o.weight !== undefined && o.weight !== null && String(o.weight).trim())
    s.weight = String(o.weight);
  if (o.style === "italic" || o.style === "normal") s.style = o.style;
  if (typeof o.color === "string" && o.color.trim()) s.color = o.color;
  if (typeof o.uppercase === "boolean") s.uppercase = o.uppercase;
  if (typeof o.letter_spacing === "string" && o.letter_spacing.trim())
    s.letterSpacing = o.letter_spacing;
  return s;
}
/** Jeton de couleur (fg/muted/accent/border) → variable CSS, sinon valeur brute. */
function resolveColor(c: string): string {
  const tokens: Record<string, string> = {
    fg: "var(--fg)",
    muted: "var(--muted)",
    accent: "var(--accent)",
    border: "var(--border)",
  };
  return tokens[c] ?? c;
}
/** Déclarations CSS d'un style d'élément (chaîne, vide si aucune propriété). */
function elementDecls(s: ElementStyle, opts?: { skipUppercase?: boolean }): string {
  const d: string[] = [];
  if (s.font) d.push(`font-family:${s.font};`);
  if (s.size) d.push(`font-size:${s.size};`);
  if (s.weight) d.push(`font-weight:${s.weight};`);
  if (s.style) d.push(`font-style:${s.style};`);
  if (s.color) d.push(`color:${resolveColor(s.color)};`);
  if (s.uppercase !== undefined && !opts?.skipUppercase)
    d.push(`text-transform:${s.uppercase ? "uppercase" : "none"};`);
  if (s.letterSpacing) d.push(`letter-spacing:${s.letterSpacing};`);
  return d.join("");
}

/** { fr: "…", en: "…" } → Multilingual (chaînes seulement, non vides). */
function multilingual(v: unknown): Multilingual {
  const out: Multilingual = {};
  if (v && typeof v === "object") {
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      if (typeof val === "string" && val.trim()) out[k] = val;
    }
  }
  return out;
}

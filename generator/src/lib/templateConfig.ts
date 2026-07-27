import { parse } from "yaml";
import type { Multilingual } from "./types";

// ─────────────────────────────────────────────────────────────
//  Templates configurables en YAML : style + mise en page (dont
//  multi-colonnes). Le YAML est converti en config typée, puis en
//  variables/règles CSS scopées à `.theme-yaml`. Le rendu des
//  entrées reste géré par l'app (renderers structurés).
// ─────────────────────────────────────────────────────────────

export interface TemplateConfig {
  layout: {
    type: "single-column" | "two-column";
    sidebar: string[]; // types de sections en colonne latérale
    sidebarSide: "left" | "right";
    sidebarWidth: string;
    columnGap: string;
    maxWidth: string;
  };
  page: { size: "a4" | "us-letter"; margin: string };
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
    nameSize: string;
    sectionTitleSize: string;
    lineHeight: string;
    alignment: "left" | "justified";
    sectionTitleStyle: "plain" | "underline" | "rule" | "small-caps";
    sectionTitleUppercase: boolean;
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
    columnGap: "2.5rem",
    maxWidth: "900px",
  },
  page: { size: "a4", margin: "16mm" },
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
    nameSize: "1.7rem",
    sectionTitleSize: "1.1rem",
    lineHeight: "1.55",
    alignment: "left",
    sectionTitleStyle: "underline",
    sectionTitleUppercase: true,
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

/** YAML de départ proposé à la création d'un template. */
export const STARTER_YAML = `name: Mon template
layout:
  type: two-column          # single-column | two-column
  sidebar: [contact, skills, distinctions, hobbies]
  sidebar_side: left        # left | right
  sidebar_width: 34%        # largeur de la colonne latérale (% conseillé ; un px
                            # paraît plus large en A4 qu'à l'écran)
  max_width: 1000px
page:
  size: us-letter           # a4 | us-letter
  margin: 16mm
colors:
  accent: "#004f90"
  # sidebar_bg: "#0f172a"
  # sidebar_fg: "#e2e8f0"
typography:
  font_body: "Inter, system-ui, sans-serif"
  base_size: 16px
  alignment: left           # left | justified
  section_titles:
    style: rule             # plain | underline | rule | small-caps
    uppercase: true
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
#   .theme-yaml .sec-title { letter-spacing: .04em; }
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
  const colors = obj(raw.colors);
  const typo = obj(raw.typography);
  const sectionTitles = obj(typo.section_titles);
  const header = obj(raw.header);
  const bullets = obj(raw.bullets);
  const contact = obj(raw.contact);
  const display = obj(raw.display);

  const config: TemplateConfig = {
    layout: {
      type: enumVal(layout.type, ["single-column", "two-column"], d.layout.type),
      sidebar: Array.isArray(layout.sidebar)
        ? (layout.sidebar as unknown[]).map(String)
        : d.layout.sidebar,
      sidebarSide: enumVal(layout.sidebar_side, ["left", "right"], d.layout.sidebarSide),
      sidebarWidth: str(layout.sidebar_width, d.layout.sidebarWidth),
      columnGap: str(layout.column_gap, d.layout.columnGap),
      maxWidth: str(layout.max_width, d.layout.maxWidth),
    },
    page: {
      size: enumVal(page.size, ["a4", "us-letter"], d.page.size),
      margin: str(page.margin, d.page.margin),
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
      nameSize: str(typo.name_size, d.typography.nameSize),
      sectionTitleSize: str(typo.section_title_size, d.typography.sectionTitleSize),
      lineHeight: str(typo.line_height, d.typography.lineHeight),
      alignment: enumVal(typo.alignment, ["left", "justified"], d.typography.alignment),
      sectionTitleStyle: enumVal(
        sectionTitles.style,
        ["plain", "underline", "rule", "small-caps"],
        d.typography.sectionTitleStyle,
      ),
      sectionTitleUppercase: bool(sectionTitles.uppercase, d.typography.sectionTitleUppercase),
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

  rules.push(`.theme-yaml .cv-name{font-size:${c.typography.nameSize};}`);
  rules.push(
    `.theme-yaml .cv-photo{width:${c.header.photoSize};height:${c.header.photoSize};border-radius:${shape};}`,
  );
  if (!c.header.photo) rules.push(`.theme-yaml .cv-photo{display:none;}`);

  // Titres de section
  const st: string[] = [`font-size:${c.typography.sectionTitleSize};`];
  st.push(c.typography.sectionTitleUppercase ? "text-transform:uppercase;" : "text-transform:none;");
  if (c.typography.sectionTitleStyle === "plain") st.push("border:none;");
  if (c.typography.sectionTitleStyle === "underline")
    st.push("border-bottom:1px solid var(--border);");
  if (c.typography.sectionTitleStyle === "rule")
    st.push("border:none;border-top:3px solid var(--accent);padding-top:.35rem;");
  if (c.typography.sectionTitleStyle === "small-caps")
    st.push("border:none;font-variant:small-caps;text-transform:none;letter-spacing:0;");
  rules.push(`.theme-yaml .sec-title{${st.join("")}}`);

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
      `.theme-yaml .two-col{display:grid;grid-template-columns:${cols};gap:${c.layout.columnGap};align-items:start;}`,
    );
    rules.push(`.theme-yaml .col-sidebar,.theme-yaml .col-main{min-width:0;}`);
    if (right) {
      rules.push(
        `.theme-yaml .col-sidebar{grid-column:2;}.theme-yaml .col-main{grid-column:1;grid-row:1;}`,
      );
    }
    if (c.colors.sidebarBg) {
      rules.push(
        `.theme-yaml .col-sidebar{background:${c.colors.sidebarBg};color:${c.colors.sidebarFg ?? "inherit"};padding:1.25rem;border-radius:var(--radius);}`,
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
        `.theme-yaml .col-main{grid-column:auto;${mainMargin}:calc(${c.layout.sidebarWidth} + ${c.layout.columnGap});}` +
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
    margin: config.page.margin,
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

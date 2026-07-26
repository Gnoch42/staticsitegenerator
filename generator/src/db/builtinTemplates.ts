// Les 5 templates de base, désormais exprimés en YAML (éditables dans l'admin
// comme les templates personnalisés). Les particularités non couvertes par les
// options (en-tête dégradé, publications numérotées…) passent par `custom_css`,
// scopé `.theme-yaml`.

export interface BuiltinTemplate {
  id: string;
  name: string;
  previewUrl: string;
  yaml: string;
}

const MINIMAL = `name: Minimaliste
layout:
  type: single-column
  max_width: 720px
colors:
  accent: "#111111"
  border: "#ececec"
typography:
  font_body: '"Helvetica Neue", Helvetica, Arial, sans-serif'
  section_title_size: 0.8rem
  section_titles:
    style: plain
    uppercase: false
contact:
  show_icons: false
custom_css: |
  .theme-yaml .site-header { border-bottom: none; padding-top: 2.5rem; }
  .theme-yaml .nav-link { font-weight: 400; color: var(--muted); }
  .theme-yaml .nav-link.active { color: var(--fg); border-bottom-color: var(--fg); }
  .theme-yaml .sec-title { color: var(--muted); font-weight: 600; }
  .theme-yaml .page { padding-top: 1rem; }
  .theme-yaml .sec { margin-bottom: 2.75rem; }
  .theme-yaml .li-dash { color: var(--muted); font-weight: 400; }
`;

const STRUCTURED = `name: Structuré
layout:
  type: two-column
  sidebar: [contact, skills, distinctions, hobbies]
  sidebar_side: left
  sidebar_width: 260px
  max_width: 1000px
colors:
  accent: "#1d4ed8"
  surface: "#f3f4f6"
  sidebar_bg: "#f3f4f6"
typography:
  section_titles:
    style: underline
    uppercase: true
custom_css: |
  .theme-yaml .site-header { background: var(--surface); border-bottom: 2px solid var(--accent); }
  .theme-yaml .col-sidebar { position: sticky; top: 1rem; }
  .theme-yaml .col-sidebar .sec-title { font-size: .95rem; }
  .theme-yaml .col-main .sec-title { border-bottom-width: 2px; }
`;

const ACADEMIC = `name: Académique
layout:
  type: single-column
  max_width: 780px
colors:
  accent: "#7c2d12"
typography:
  font_body: '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif'
  alignment: justified
  section_title_size: 1.25rem
  section_titles:
    style: small-caps
    uppercase: false
contact:
  show_icons: false
custom_css: |
  .theme-yaml .sec-title { border-bottom: 1px solid var(--fg); color: var(--fg); }
  .theme-yaml .nav-link.active { border-bottom-color: var(--accent); color: var(--accent); }
  .theme-yaml .page-research .pub-list { padding-left: 0; list-style: none; counter-reset: pub; }
  .theme-yaml .page-research .pub-item { counter-increment: pub; position: relative; padding-left: 2.25rem; margin-bottom: 1.75rem; }
  .theme-yaml .page-research .pub-item::before { content: "[" counter(pub) "]"; position: absolute; left: 0; top: 0; color: var(--accent); font-weight: 600; }
  .theme-yaml .pub-title { font-size: 1.05rem; }
`;

const MODERN = `name: Moderne
layout:
  type: single-column
  max_width: 820px
colors:
  accent: "#7c3aed"
  border: "#ece9f5"
  surface: "#f6f3fe"
typography:
  font_body: '"Inter", system-ui, -apple-system, sans-serif'
  section_title_size: 1.15rem
  section_titles:
    style: plain
    uppercase: false
custom_css: |
  .theme-yaml .site-header { background: linear-gradient(120deg, var(--accent), #ec4899); border-bottom: none; border-radius: 0 0 16px 16px; max-width: none; padding: 1.1rem 1.5rem; }
  .theme-yaml .site-brand, .theme-yaml .nav-link { color: #fff; }
  .theme-yaml .nav-link { opacity: .85; font-weight: 600; }
  .theme-yaml .nav-link.active { opacity: 1; border-bottom-color: #fff; }
  .theme-yaml .lang-btn { color: #fff; }
  .theme-yaml .lang-switch { border-color: rgba(255,255,255,.5); }
  .theme-yaml .pdf-btn { border-color: #fff; color: #fff; }
  .theme-yaml .pdf-btn:hover { background: #fff; color: var(--accent); }
  .theme-yaml .sec-title { color: var(--accent); border-bottom: 2px solid var(--surface); }
  .theme-yaml .tag { background: var(--surface); border-color: var(--surface); color: var(--accent); }
`;

const SLATE = `name: Slate
layout:
  type: two-column
  sidebar: [contact, skills, distinctions, hobbies]
  sidebar_side: left
  sidebar_width: 280px
  max_width: 1000px
colors:
  accent: "#0f766e"
  sidebar_bg: "#0f172a"
  sidebar_fg: "#e2e8f0"
typography:
  section_titles:
    style: underline
    uppercase: true
custom_css: |
  .theme-yaml .site-header { border-bottom: 2px solid var(--accent); }
  .theme-yaml .two-col { gap: 0; }
  .theme-yaml .col-sidebar { padding: 1.5rem; }
  .theme-yaml .col-sidebar .sec-title { color: #5eead4; border-bottom-color: #1e293b; }
  .theme-yaml .col-sidebar a { color: #7dd3fc; }
  .theme-yaml .col-sidebar .contact-label, .theme-yaml .col-sidebar .tag { color: #94a3b8; }
  .theme-yaml .col-sidebar .tag { background: #1e293b; border-color: #334155; }
  .theme-yaml .col-main { padding-left: 2rem; }
`;

export const BUILTIN_TEMPLATES: BuiltinTemplate[] = [
  { id: "minimal", name: "Minimaliste", previewUrl: "/themes/minimal.png", yaml: MINIMAL },
  { id: "structured", name: "Structuré", previewUrl: "/themes/structured.png", yaml: STRUCTURED },
  { id: "academic", name: "Académique", previewUrl: "/themes/academic.png", yaml: ACADEMIC },
  { id: "modern", name: "Moderne", previewUrl: "/themes/modern.png", yaml: MODERN },
  { id: "slate", name: "Slate", previewUrl: "/themes/slate.png", yaml: SLATE },
];

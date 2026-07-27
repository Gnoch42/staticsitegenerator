// Templates de base fournis, exprimés en YAML « plein modèle » : ils
// s'appuient sur les options structurées (layout / colors / typography /
// display) plutôt que sur du custom_css. Éditables dans l'admin comme
// n'importe quel template.

export interface BuiltinTemplate {
  id: string;
  name: string;
  previewUrl: string;
  yaml: string;
}

const STRUCTURED = `name: Structuré
layout:
  type: two-column
  sidebar: [contact, skills, distinctions, hobbies]
  sidebar_side: left
  sidebar_width: 30%        # % conseillé (constant écran/impression ; un px paraît large en A4)
  max_width: 1000px
page:
  size: a4
spacing:                    # buffers (écran ET PDF)
  page_margin: 16mm         # marge autour de la page
  column_gap: 6%            # entre la colonne latérale et la principale
  sidebar_padding: 1.25rem  # marge intérieure du panneau latéral
  section_gap: 1.5rem       # entre les sections
  item_gap: 1rem            # entre les items (expériences, publications…)
colors:
  accent: "#1d4ed8"
  sidebar_bg: "#f3f4f6"
typography:
  base_size: 16px
  line_height: 1.55
  alignment: left
  # Style par élément — font, size, weight, style (normal|italic),
  # color (hex ou fg|muted|accent|border), uppercase, letter_spacing.
  elements:
    name:          { size: 1.7rem, weight: 700 }
    section_title: { size: 1.1rem, uppercase: true, color: accent, style: underline }
    job_title:     { size: 1rem, weight: 600 }
    organization:  { size: .9rem, color: muted }
    dates:         { size: .85rem, color: muted }
    summary:       { size: 1rem }
    description:   { size: 1rem }
    skill_category:{ weight: 600 }
    skill_level:   { color: muted }
    contact:       { size: 1rem }
    tag:           { size: .85rem }
    publication_title:    { size: 1rem, weight: 600 }
    publication_authors:  { size: .9rem }
    publication_venue:    { size: .9rem, color: muted, style: italic }
    publication_abstract: { size: .95rem }
`;

const ACADEMIC = `name: Académique
layout:
  type: single-column
  max_width: 780px
page:
  size: a4
spacing:
  page_margin: 18mm
  column_gap: 6%
  sidebar_padding: 1.25rem
  section_gap: 1.6rem
  item_gap: 1.1rem
colors:
  accent: "#7c2d12"
typography:
  font_body: '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif'
  font_headings: '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif'
  base_size: 16px
  line_height: 1.55
  alignment: justified
  elements:
    name:          { size: 1.7rem, weight: 700 }
    section_title: { size: 1.25rem, style: small-caps, uppercase: false, color: accent }
    job_title:     { size: 1rem, weight: 600 }
    organization:  { size: .9rem, color: muted }
    dates:         { size: .85rem, color: muted }
    summary:       { size: 1rem }
    description:   { size: 1rem }
    skill_category:{ weight: 600 }
    skill_level:   { color: muted }
    contact:       { size: 1rem }
    tag:           { size: .85rem }
    publication_title:    { size: 1rem, weight: 600 }
    publication_authors:  { size: .9rem }
    publication_venue:    { size: .9rem, color: muted, style: italic }
    publication_abstract: { size: .95rem }
contact:
  show_icons: false
`;

export const BUILTIN_TEMPLATES: BuiltinTemplate[] = [
  { id: "structured", name: "Structuré", previewUrl: "/themes/structured.png", yaml: STRUCTURED },
  { id: "academic", name: "Académique", previewUrl: "/themes/academic.png", yaml: ACADEMIC },
];

/** Anciens templates de base retirés (supprimés au démarrage). */
export const REMOVED_TEMPLATE_IDS = ["minimal", "modern", "slate"];

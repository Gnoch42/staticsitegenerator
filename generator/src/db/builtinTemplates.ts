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
  sidebar_width: 280px
  max_width: 1000px
colors:
  accent: "#1d4ed8"
  sidebar_bg: "#f3f4f6"
typography:
  section_titles:
    style: underline
    uppercase: true
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
`;

export const BUILTIN_TEMPLATES: BuiltinTemplate[] = [
  { id: "structured", name: "Structuré", previewUrl: "/themes/structured.png", yaml: STRUCTURED },
  { id: "academic", name: "Académique", previewUrl: "/themes/academic.png", yaml: ACADEMIC },
];

/** Anciens templates de base retirés (supprimés au démarrage). */
export const REMOVED_TEMPLATE_IDS = ["minimal", "modern", "slate"];

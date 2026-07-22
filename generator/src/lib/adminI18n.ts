// ─────────────────────────────────────────────────────────────
//  Traductions de l'INTERFACE d'administration (fr/en), indépendantes
//  de la langue du contenu du CV. La langue admin est stockée dans
//  site.admin_language.
// ─────────────────────────────────────────────────────────────

export type AdminLang = "fr" | "en";

type Dict = Record<string, { fr: string; en: string }>;

export const ADMIN_STRINGS: Dict = {
  // Chrome
  app_title: { fr: "Éditeur du site CV", en: "CV site editor" },
  preview: { fr: "Aperçu", en: "Preview" },
  logout: { fr: "Déconnexion", en: "Log out" },
  drag: { fr: "Glisser", en: "Drag" },
  save: { fr: "Enregistrer", en: "Save" },
  saved: { fr: "Enregistré ✓", en: "Saved ✓" },
  delete: { fr: "Supprimer", en: "Delete" },
  edit: { fr: "Edit", en: "Edit" },
  add: { fr: "Ajouter", en: "Add" },

  // Tabs
  tab_settings: { fr: "Réglages", en: "Settings" },
  tab_cv: { fr: "CV", en: "CV" },
  tab_video: { fr: "Vidéo", en: "Video" },
  tab_research: { fr: "Publications", en: "Publications" },
  tab_portfolio: { fr: "Portfolio", en: "Portfolio" },
  tab_contact: { fr: "Contact", en: "Contact" },

  // Login
  login_title: { fr: "Connexion", en: "Sign in" },
  login_sub: { fr: "Accès à l'éditeur du site.", en: "Access to the site editor." },
  login_password: { fr: "Mot de passe", en: "Password" },
  login_submit: { fr: "Se connecter", en: "Sign in" },
  login_error: { fr: "Mot de passe incorrect.", en: "Incorrect password." },

  // Publish
  publish_title: { fr: "Publication", en: "Publishing" },
  publish_never: { fr: "Jamais publié.", en: "Never published." },
  publish_last: { fr: "Dernière publication :", en: "Last published:" },
  publish_btn: { fr: "Publier", en: "Publish" },
  publish_running: { fr: "Publication…", en: "Publishing…" },
  publish_error: {
    fr: "Échec de la publication. Vérifiez les logs du serveur.",
    en: "Publishing failed. Check the server logs.",
  },

  // Identity
  identity_title: { fr: "Nom / identité", en: "Name / identity" },
  identity_hint: {
    fr: "Affiché en en-tête du site et en haut du CV.",
    en: "Shown in the site header and at the top of the CV.",
  },
  identity_name_ph: { fr: "Prénom Nom", en: "First Last" },
  photo_label: { fr: "Photo de profil", en: "Profile photo" },
  photo_hint: {
    fr: "Optionnelle — affichée en haut du CV.",
    en: "Optional — shown at the top of the CV.",
  },

  // Template
  template_title: { fr: "Template", en: "Template" },
  template_hint: {
    fr: "Appliqué immédiatement — l'aperçu se met à jour sans republier.",
    en: "Applied immediately — the preview updates without republishing.",
  },

  // Languages (content)
  langs_title: { fr: "Langues du contenu", en: "Content languages" },
  langs_default: { fr: "Langue par défaut", en: "Default language" },

  // Admin language
  adminlang_title: { fr: "Langue de l'interface", en: "Interface language" },
  adminlang_hint: {
    fr: "Langue de l'administration (indépendante du contenu du CV).",
    en: "Admin language (independent of the CV content).",
  },

  // Pages
  pages_title: { fr: "Pages / onglets", en: "Pages / tabs" },
  pages_hint: {
    fr: "Décochez un onglet pour le retirer du site publié (il reste éditable ici).",
    en: "Uncheck a tab to remove it from the published site (still editable here).",
  },
  page_sections: { fr: "section(s)", en: "section(s)" },
  enabled: { fr: "Activée", en: "Enabled" },

  // Profiles
  profiles_title: { fr: "Profils de CV", en: "CV profiles" },
  profiles_hint: {
    fr: "Créez des variantes ciblées (poste/entreprise). Le profil actif est utilisé à la publication et au PDF. Un item sans profil apparaît partout.",
    en: "Create targeted variants (role/company). The active profile is used for publishing and the PDF. An item with no profile appears everywhere.",
  },
  profile_active: { fr: "Profil actif", en: "Active profile" },
  profile_full_cv: { fr: "CV complet (tous les items)", en: "Full CV (all items)" },
  profile_new_ph: { fr: "Nom du profil (ex. Backend @ Acme)", en: "Profile name (e.g. Backend @ Acme)" },
  profile_add: { fr: "Créer le profil", en: "Create profile" },
  profile_rename: { fr: "Renommer", en: "Rename" },
  profile_none: { fr: "Aucun profil. Créez-en un pour cibler le CV.", en: "No profiles yet. Create one to target the CV." },
  item_profiles_label: { fr: "Profils", en: "Profiles" },
  item_profiles_all: { fr: "Tous (aucun profil = toujours inclus)", en: "All (no profile = always included)" },

  // Sections / items editor
  section_add: { fr: "Ajouter une section", en: "Add a section" },
  section_none: { fr: "Aucune section pour l'instant.", en: "No sections yet." },
  section_delete_confirm: {
    fr: "Supprimer cette section et tous ses items ?",
    en: "Delete this section and all its items?",
  },
  item_add: { fr: "Ajouter un item", en: "Add an item" },
  item_word: { fr: "Item", en: "Item" },
  translate: { fr: "Traduire", en: "Translate" },
  title_word: { fr: "Titre", en: "Title" },

  // Visibility
  vis_where: { fr: "Où afficher ?", en: "Show where?" },
  vis_both: { fr: "En ligne + PDF", en: "Online + PDF" },
  vis_online: { fr: "En ligne seulement", en: "Online only" },
  vis_print: { fr: "PDF seulement", en: "PDF only" },
  vis_section: { fr: "Visibilité de la section", en: "Section visibility" },
  vis_item: { fr: "Visibilité de l'item", en: "Item visibility" },

  // CV page / PDF
  pdf_download: { fr: "Télécharger le CV en PDF", en: "Download CV as PDF" },

  // Item fields
  f_type: { fr: "Type", en: "Type" },
  f_value: { fr: "Valeur", en: "Value" },
  f_label: { fr: "Libellé", en: "Label" },
  f_provider: { fr: "Fournisseur", en: "Provider" },
  f_url: { fr: "URL", en: "URL" },
  f_caption: { fr: "Légende", en: "Caption" },
  f_image: { fr: "Image (URL ou upload)", en: "Image (URL or upload)" },
  f_upload: { fr: "Téléverser", en: "Upload" },
  f_uploading: { fr: "Envoi…", en: "Uploading…" },
  f_alt: { fr: "Texte alternatif (accessibilité)", en: "Alt text (accessibility)" },
  f_link: { fr: "Lien (optionnel)", en: "Link (optional)" },
  f_title: { fr: "Titre", en: "Title" },
  f_organization: { fr: "Organisation", en: "Organization" },
  f_location: { fr: "Lieu", en: "Location" },
  f_description: { fr: "Description", en: "Description" },
  f_text: { fr: "Texte", en: "Text" },
  f_heading: { fr: "Titre du bloc", en: "Block heading" },
  f_body: { fr: "Contenu", en: "Body" },
  f_category: { fr: "Catégorie", en: "Category" },
  f_venue: { fr: "Revue / lieu", en: "Venue" },
  f_abstract: { fr: "Résumé", en: "Abstract" },
  f_start: { fr: "Début (AAAA-MM)", en: "Start (YYYY-MM)" },
  f_end: { fr: "Fin (AAAA-MM)", en: "End (YYYY-MM)" },
  f_year: { fr: "Année", en: "Year" },
  f_authors: { fr: "Auteurs", en: "Authors" },
  f_doi: { fr: "Lien (DOI/URL)", en: "Link (DOI/URL)" },
};

export function tAdmin(key: string, lang: AdminLang): string {
  const e = ADMIN_STRINGS[key];
  if (!e) return key;
  return e[lang] ?? e.fr;
}

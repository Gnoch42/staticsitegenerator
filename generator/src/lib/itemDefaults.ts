import type { SectionType, ItemData } from "./types";

/** Structure `data` initiale d'un nouvel item selon le type de section. */
export function defaultItemData(
  type: SectionType,
  langs: string[],
): ItemData {
  const perLang = (fields: Record<string, string>) =>
    Object.fromEntries(langs.map((l) => [l, { ...fields }]));
  const label = () => Object.fromEntries(langs.map((l) => [l, ""]));

  switch (type) {
    case "contact":
    case "contact_links":
      return { kind: "email", label: label(), value: "" };
    case "summary":
      return perLang({ text: "" });
    case "custom":
      return perLang({ heading: "", body: "" });
    case "experience":
    case "involvement":
    case "education":
      return {
        ...perLang({
          title: "",
          organization: "",
          location: "",
          description: "",
        }),
        start_date: "",
        end_date: "",
      };
    case "formation":
      return {
        ...perLang({ title: "", organization: "", description: "" }),
        issue_date: "",
        expiry_date: "",
      };
    case "distinctions":
      return {
        ...perLang({ title: "", organization: "", description: "" }),
        year: "",
      };
    case "skills":
      return perLang({ category: "", value: "", level: "" });
    case "hobbies":
      return perLang({ value: "" });
    case "video_embed":
      return { provider: "youtube", url: "", caption: label() };
    case "portfolio_gallery":
    case "image":
      return { image: "", link: "", caption: label() };
    case "links":
      return { label: label(), url: "" };
    case "html":
      return perLang({ html: "" });
    case "hero":
      return {
        image: "",
        button_url: "",
        ...perLang({ title: "", subtitle: "", button_label: "" }),
      };
    case "publication_list":
      return {
        ...perLang({ title: "", venue: "", abstract: "" }),
        year: new Date().getFullYear(),
        authors: "",
        link: "",
      };
    default:
      return perLang({ text: "" });
  }
}

/** Champs multilingues (structurés par langue) éditables par type. */
export const MULTILINGUAL_FIELDS: Partial<Record<SectionType, string[]>> = {
  summary: ["text"],
  custom: ["heading", "body"],
  experience: ["title", "organization", "location", "description"],
  involvement: ["title", "organization", "location", "description"],
  education: ["title", "organization", "location", "description"],
  formation: ["title", "organization", "description"],
  distinctions: ["title", "organization", "description"],
  skills: ["category", "value", "level"],
  hobbies: ["value"],
  publication_list: ["title", "venue", "abstract"],
};

/** Champs simples (non multilingues) par type. */
export const FLAT_FIELDS: Partial<
  Record<SectionType, { key: string; label: string; type?: string }[]>
> = {
  experience: [
    { key: "start_date", label: "Début (AAAA-MM)" },
    { key: "end_date", label: "Fin (AAAA-MM)" },
  ],
  involvement: [
    { key: "start_date", label: "Début (AAAA-MM)" },
    { key: "end_date", label: "Fin (AAAA-MM)" },
  ],
  education: [
    { key: "start_date", label: "Début (AAAA-MM)" },
    { key: "end_date", label: "Fin (AAAA-MM)" },
  ],
  formation: [
    { key: "issue_date", label: "Émission (AAAA-MM)" },
    { key: "expiry_date", label: "Expiration (AAAA-MM)" },
  ],
  distinctions: [{ key: "year", label: "Année", type: "number" }],
  publication_list: [
    { key: "year", label: "Année", type: "number" },
    { key: "authors", label: "Auteurs" },
    { key: "link", label: "Lien (DOI/URL)" },
  ],
};

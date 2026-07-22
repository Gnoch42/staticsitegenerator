import type { Multilingual } from "@/lib/types";

/**
 * Émet une valeur multilingue sous forme de spans par langue.
 * Le CSS de base (`base.css`) n'affiche que la langue active
 * (attribut `data-active-lang` sur `.site-root`), ce qui permet la
 * bascule FR/EN sans recharger — en preview comme sur le site publié.
 */
export function I18n({
  field,
  langs,
  className,
}: {
  field: Multilingual | null | undefined;
  langs: string[];
  className?: string;
}) {
  if (!field) return null;
  return (
    <span className={`i18n${className ? " " + className : ""}`}>
      {langs.map((lang) => (
        <span key={lang} data-lang={lang}>
          {field[lang] ?? ""}
        </span>
      ))}
    </span>
  );
}

/** Extrait un sous-champ multilingue depuis des data structurées par langue. */
export function pickField(
  data: Record<string, unknown>,
  langs: string[],
  key: string,
): Multilingual {
  const out: Multilingual = {};
  for (const lang of langs) {
    const perLang = data[lang];
    if (perLang && typeof perLang === "object") {
      const v = (perLang as Record<string, unknown>)[key];
      if (typeof v === "string") out[lang] = v;
    }
  }
  return out;
}

/** Vrai si au moins une langue a une valeur non vide pour ce champ. */
export function hasContent(field: Multilingual): boolean {
  return Object.values(field).some((v) => v && v.trim().length > 0);
}

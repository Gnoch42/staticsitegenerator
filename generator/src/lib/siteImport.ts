import "server-only";
import { stringify } from "yaml";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { site, templates } from "@/db/schema";
import { splitSiteYaml } from "./siteYaml";
import { parseContentYaml } from "./contentYaml";
import { applyContent } from "./contentImport";
import { parseSettingsYaml } from "./settingsYaml";
import { applySettings } from "./settingsImport";
import { parseLocaleYaml } from "./locale";
import { parseTemplateConfig } from "./templateConfig";

/**
 * Applique un YAML « site complet ». Ordre : settings (fixe le template actif
 * + les langues) → design (met à jour le YAML du template actif) → locale → cv.
 * Chaque catégorie est optionnelle. Renvoie un message d'erreur clair au lieu
 * de lever, pour l'affichage dans l'éditeur.
 */
export function applySiteYaml(text: string): { ok: boolean; error?: string } {
  const { parts, error } = splitSiteYaml(text);
  if (error || !parts) return { ok: false, error: error ?? "YAML invalide" };

  // Valider tout avant d'appliquer quoi que ce soit.
  const settings = parts.settings !== undefined
    ? parseSettingsYaml(stringify(parts.settings))
    : null;
  if (settings?.error) return { ok: false, error: `settings : ${settings.error}` };

  const content = parts.cv !== undefined
    ? parseContentYaml(stringify(parts.cv))
    : null;
  if (content?.error) return { ok: false, error: `cv : ${content.error}` };

  const locale = parts.locale !== undefined
    ? parseLocaleYaml(stringify(parts.locale))
    : null;
  if (locale?.error) return { ok: false, error: `locale : ${locale.error}` };

  try {
    if (settings?.settings) applySettings(settings.settings);

    // design → YAML du template actif (après settings, qui a pu le changer).
    if (parts.design !== undefined) {
      const yaml = stringify(parts.design);
      const activeId = db.select().from(site).where(eq(site.id, 1)).get()?.templateId;
      if (activeId) {
        const { name } = parseTemplateConfig(yaml);
        const patch: { yaml: string; name?: string } = { yaml };
        if (name && name.trim()) patch.name = name.trim();
        db.update(templates).set(patch).where(eq(templates.id, activeId)).run();
      }
    }

    if (locale?.locale) {
      db.update(site).set({ locale: locale.locale }).where(eq(site.id, 1)).run();
    }

    if (content?.content) applyContent(content.content);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Échec de l'import" };
  }
  return { ok: true };
}

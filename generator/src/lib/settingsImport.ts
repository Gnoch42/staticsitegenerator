import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { site, templates, pages, profiles } from "@/db/schema";
import type { ParsedSettings } from "./settingsYaml";
import { slugify } from "./slug";

/**
 * Applique des réglages parsés à la base (transactionnel : tout ou rien).
 * Seuls les champs présents sont modifiés. Les profils listés sont
 * créés/réordonnés (jamais supprimés automatiquement — utiliser l'interface).
 * Lève une Error à message clair si une référence est introuvable.
 */
export function applySettings(s: ParsedSettings): void {
  db.transaction((tx) => {
    const siteRow = tx.select().from(site).where(eq(site.id, 1)).get();
    if (!siteRow) throw new Error("Ligne « site » absente.");
    const allTemplates = tx.select().from(templates).all();
    const allPages = tx.select().from(pages).all();

    // ── Profils : créer / réordonner selon la liste (pas de suppression) ──
    let allProfiles = tx.select().from(profiles).all();
    const findProf = (name: string) =>
      allProfiles.find((p) => p.name.toLowerCase() === name.toLowerCase());

    if (s.profiles) {
      const listed = new Set<number>();
      s.profiles.forEach((name, i) => {
        const existing = findProf(name);
        if (existing) {
          tx.update(profiles).set({ position: i }).where(eq(profiles.id, existing.id)).run();
          listed.add(existing.id);
        } else {
          const res = tx
            .insert(profiles)
            .values({ name, slug: slugify(name), position: i })
            .run();
          listed.add(Number(res.lastInsertRowid));
        }
      });
      // Les profils non listés restent, placés après le bloc listé.
      const trailing = allProfiles
        .filter((p) => !listed.has(p.id))
        .sort((a, b) => a.position - b.position);
      trailing.forEach((p, i) => {
        tx.update(profiles).set({ position: s.profiles!.length + i }).where(eq(profiles.id, p.id)).run();
      });
      allProfiles = tx.select().from(profiles).all(); // recharge (ids/positions à jour)
    }
    const resolveProf = (name: string) =>
      allProfiles.find((p) => p.name.toLowerCase() === name.toLowerCase());

    // ── Champs de la table site ──
    const patch: Partial<typeof siteRow> = {};

    if (s.templateId !== undefined) {
      const t =
        allTemplates.find((x) => x.id === s.templateId) ??
        allTemplates.find((x) => x.name.toLowerCase() === s.templateId!.toLowerCase());
      if (!t) throw new Error(`Template introuvable : « ${s.templateId} ».`);
      patch.templateId = t.id;
    }

    if (s.languages !== undefined || s.defaultLanguage !== undefined) {
      const langs = s.languages ?? siteRow.languages;
      let def = s.defaultLanguage ?? siteRow.defaultLanguage;
      if (!langs.includes(def)) def = langs[0];
      patch.languages = langs;
      patch.defaultLanguage = def;
    }

    if (s.adminLanguage !== undefined) patch.adminLanguage = s.adminLanguage;
    if (s.ownerName !== undefined) patch.ownerName = s.ownerName;
    if (s.photoUrl !== undefined) patch.photoUrl = s.photoUrl;

    if (s.photoProfiles !== undefined) {
      patch.photoProfileIds = s.photoProfiles
        .map((n) => resolveProf(n)?.id)
        .filter((id): id is number => id !== undefined);
    }

    if (s.activeProfile !== undefined) {
      if (s.activeProfile === null) {
        patch.activeProfileId = null;
      } else {
        const p = resolveProf(s.activeProfile);
        if (!p) throw new Error(`Profil actif introuvable : « ${s.activeProfile} ».`);
        patch.activeProfileId = p.id;
      }
    }

    if (Object.keys(patch).length > 0) {
      tx.update(site).set(patch).where(eq(site.id, 1)).run();
    }

    // ── Visibilité des onglets ──
    if (s.pages) {
      for (const p of s.pages) {
        const row = allPages.find((x) => x.type === p.type);
        if (row) tx.update(pages).set({ enabled: p.enabled }).where(eq(pages.id, row.id)).run();
      }
    }
  });
}

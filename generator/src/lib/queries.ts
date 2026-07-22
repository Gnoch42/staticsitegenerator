import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  site,
  templates,
  pages,
  sections,
  items,
  profiles,
  itemProfiles,
} from "@/db/schema";
import type {
  Section,
  Item,
  Page,
  Site,
  Template,
  Profile,
} from "@/db/schema";

export interface ItemWithProfiles extends Item {
  profileIds: number[];
}
export interface SectionWithItems extends Section {
  items: ItemWithProfiles[];
}
export interface PageWithSections extends Page {
  sections: SectionWithItems[];
}
export interface FullSite {
  site: Site;
  template: Template;
  templates: Template[];
  pages: PageWithSections[];
  profiles: Profile[];
}

/** Charge tout le site (site + template actif + pages/sections/items ordonnés). */
export async function getFullSite(): Promise<FullSite> {
  const siteRow = db.select().from(site).where(eq(site.id, 1)).get();
  if (!siteRow) throw new Error("Ligne 'site' absente : bootstrap non exécuté ?");

  const allTemplates = db.select().from(templates).all();
  const template = allTemplates.find((t) => t.id === siteRow.templateId)!;
  const profileRows = db
    .select()
    .from(profiles)
    .orderBy(asc(profiles.position))
    .all();

  const pageRows = db.select().from(pages).orderBy(asc(pages.position)).all();
  const sectionRows = db
    .select()
    .from(sections)
    .orderBy(asc(sections.position))
    .all();
  const itemRows = db.select().from(items).orderBy(asc(items.position)).all();
  const links = db.select().from(itemProfiles).all();

  // item_id → [profile_id]
  const byItem = new Map<number, number[]>();
  for (const l of links) {
    const arr = byItem.get(l.itemId) ?? [];
    arr.push(l.profileId);
    byItem.set(l.itemId, arr);
  }

  const pagesWithSections: PageWithSections[] = pageRows.map((p) => ({
    ...p,
    sections: sectionRows
      .filter((s) => s.pageId === p.id)
      .map((s) => ({
        ...s,
        items: itemRows
          .filter((it) => it.sectionId === s.id)
          .map((it) => ({ ...it, profileIds: byItem.get(it.id) ?? [] })),
      })),
  }));

  return {
    site: siteRow,
    template,
    templates: allTemplates,
    pages: pagesWithSections,
    profiles: profileRows,
  };
}

/** Charge une seule page par type (pour l'édition et le rendu ciblé). */
export async function getPageByType(
  type: string,
): Promise<PageWithSections | null> {
  const full = await getFullSite();
  return full.pages.find((p) => p.type === type) ?? null;
}

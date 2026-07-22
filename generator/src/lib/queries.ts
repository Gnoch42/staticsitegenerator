import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { site, templates, pages, sections, items } from "@/db/schema";
import type { Section, Item, Page, Site, Template } from "@/db/schema";

export interface SectionWithItems extends Section {
  items: Item[];
}
export interface PageWithSections extends Page {
  sections: SectionWithItems[];
}
export interface FullSite {
  site: Site;
  template: Template;
  templates: Template[];
  pages: PageWithSections[];
}

/** Charge tout le site (site + template actif + pages/sections/items ordonnés). */
export async function getFullSite(): Promise<FullSite> {
  const siteRow = db.select().from(site).where(eq(site.id, 1)).get();
  if (!siteRow) throw new Error("Ligne 'site' absente : bootstrap non exécuté ?");

  const allTemplates = db.select().from(templates).all();
  const template = allTemplates.find((t) => t.id === siteRow.templateId)!;

  const pageRows = db.select().from(pages).orderBy(asc(pages.position)).all();
  const sectionRows = db
    .select()
    .from(sections)
    .orderBy(asc(sections.position))
    .all();
  const itemRows = db.select().from(items).orderBy(asc(items.position)).all();

  const pagesWithSections: PageWithSections[] = pageRows.map((p) => ({
    ...p,
    sections: sectionRows
      .filter((s) => s.pageId === p.id)
      .map((s) => ({
        ...s,
        items: itemRows.filter((it) => it.sectionId === s.id),
      })),
  }));

  return { site: siteRow, template, templates: allTemplates, pages: pagesWithSections };
}

/** Charge une seule page par type (pour l'édition et le rendu ciblé). */
export async function getPageByType(
  type: string,
): Promise<PageWithSections | null> {
  const full = await getFullSite();
  return full.pages.find((p) => p.type === type) ?? null;
}

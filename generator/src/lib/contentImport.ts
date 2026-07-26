import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { pages, sections, items, profiles, itemProfiles } from "@/db/schema";
import type { ParsedContent } from "./contentYaml";
import { slugify } from "./slug";

/**
 * Réécrit le contenu de la base à partir d'un contenu YAML parsé.
 * Seules les pages présentes dans `content` sont remplacées (les autres
 * restent intactes). Transactionnel : tout ou rien.
 */
export function applyContent(content: ParsedContent): void {
  db.transaction((tx) => {
    const allPages = tx.select().from(pages).all();
    const allProfiles = tx.select().from(profiles).all();
    const profByName = new Map(
      allProfiles.map((p) => [p.name.toLowerCase(), p.id]),
    );

    const resolveProfile = (name: string): number => {
      const existing = profByName.get(name.toLowerCase());
      if (existing) return existing;
      const res = tx
        .insert(profiles)
        .values({ name, slug: slugify(name), position: profByName.size })
        .run();
      const id = Number(res.lastInsertRowid);
      profByName.set(name.toLowerCase(), id);
      return id;
    };

    for (const page of content.pages) {
      const pageRow = allPages.find((p) => p.type === page.type);
      if (!pageRow) continue; // page absente : ignorée

      tx.delete(sections).where(eq(sections.pageId, pageRow.id)).run();

      page.sections.forEach((s, si) => {
        const secRes = tx
          .insert(sections)
          .values({
            pageId: pageRow.id,
            type: s.type,
            enabled: true,
            position: si,
            title: s.title ?? undefined,
            visibility: "both",
          })
          .run();
        const sectionId = Number(secRes.lastInsertRowid);

        s.items.forEach((it, ii) => {
          const itemRes = tx
            .insert(items)
            .values({ sectionId, position: ii, data: it.data })
            .run();
          const itemId = Number(itemRes.lastInsertRowid);
          for (const name of it.profiles) {
            tx.insert(itemProfiles)
              .values({ itemId, profileId: resolveProfile(name) })
              .run();
          }
        });
      });
    }
  });
}

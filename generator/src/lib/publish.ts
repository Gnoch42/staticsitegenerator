import "server-only";
import { promises as fs } from "node:fs";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { site } from "@/db/schema";
import { getFullSite } from "./queries";
import { getTemplate } from "@/templates";
import { renderPageDocument } from "./render";

const OUT_DIR = process.env.SITE_OUTPUT_DIR ?? "./data/site";
const THEMES_DIR = join(process.cwd(), "public", "themes");

export interface PublishResult {
  pages: string[];
  outputDir: string;
  publishedAt: Date;
}

/**
 * Rend le site statique (toutes les pages activées, toutes les langues)
 * et l'écrit dans le volume partagé, prêt à être servi par Caddy.
 * Ne dépend d'aucun service externe — 100 % local à l'instance.
 */
export async function publishSite(): Promise<PublishResult> {
  const full = await getFullSite();

  // Repart d'un dossier propre pour éviter les fichiers orphelins.
  await fs.rm(OUT_DIR, { recursive: true, force: true });
  const assetsDir = join(OUT_DIR, "assets");
  await fs.mkdir(assetsDir, { recursive: true });

  // Copie des feuilles de style (base + thème actif + print).
  const { css } = getTemplate(full.site.templateId);
  for (const file of ["base.css", "print.css", css]) {
    await fs.copyFile(join(THEMES_DIR, file), join(assetsDir, file));
  }

  const enabledPages = full.pages.filter((p) => p.enabled);
  const written: string[] = [];

  for (const page of enabledPages) {
    const html = await renderPageDocument(full, page, {
      linkFor: (slug) => `/${slug}/`,
      activeLang: full.site.defaultLanguage,
    });
    const dir = join(OUT_DIR, page.slug);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(join(dir, "index.html"), html, "utf8");
    written.push(`/${page.slug}/`);
  }

  // index racine : redirection vers la première page activée.
  const home = enabledPages[0];
  if (home) {
    await fs.writeFile(
      join(OUT_DIR, "index.html"),
      redirectHtml(`/${home.slug}/`),
      "utf8",
    );
  }

  const publishedAt = new Date();
  db.update(site).set({ publishedAt }).where(eq(site.id, 1)).run();

  return { pages: written, outputDir: OUT_DIR, publishedAt };
}

function redirectHtml(to: string): string {
  return `<!doctype html><html><head><meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=${to}">
<link rel="canonical" href="${to}"></head>
<body><a href="${to}">${to}</a></body></html>`;
}

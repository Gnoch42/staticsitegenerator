import "server-only";
import { promises as fs } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";
import { getFullSite } from "./queries";
import { getTemplate } from "@/templates";
import { renderPageElement } from "./render";
import { renderElementToString } from "./renderToString";

const THEMES_DIR = join(process.cwd(), "public", "themes");

/**
 * Rend la page CV en PDF A4 via Playwright, avec le CSS d'impression
 * dédié. Le HTML (CSS inclus) est injecté directement dans la page
 * headless — aucun élément de nav/UI, une seule langue figée.
 */
export async function renderCvPdf(
  lang?: string,
  profileId?: number | null,
): Promise<Uint8Array> {
  const full = await getFullSite();
  const cv = full.pages.find((p) => p.type === "cv");
  if (!cv) throw new Error("Page CV introuvable");

  const onlyLang = lang ?? full.site.defaultLanguage;
  const { css } = getTemplate(full.site.templateId);

  const [baseCss, themeCss, printCss] = await Promise.all([
    fs.readFile(join(THEMES_DIR, "base.css"), "utf8"),
    fs.readFile(join(THEMES_DIR, css), "utf8"),
    fs.readFile(join(THEMES_DIR, "print.css"), "utf8"),
  ]);

  const body = await renderElementToString(
    renderPageElement(full, cv, {
      linkFor: () => "#",
      activeLang: onlyLang,
      onlyLang,
      mode: "print",
      profileId: profileId !== undefined ? profileId : full.site.activeProfileId,
      showPdf: false,
    }),
  );

  const html = `<!doctype html><html lang="${onlyLang}"><head>
<meta charset="utf-8">
<style>${baseCss}\n${themeCss}\n${printCss}</style>
</head><body>${body}</body></html>`;

  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "16mm", bottom: "16mm", left: "14mm", right: "14mm" },
    });
    return new Uint8Array(pdf);
  } finally {
    await browser.close();
  }
}

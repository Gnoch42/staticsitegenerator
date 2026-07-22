import "server-only";
import type { ReactElement } from "react";
import type { FullSite, PageWithSections } from "./queries";
import { getTemplate } from "@/templates";
import { buildNav } from "@/components/render/SiteHeader";
import { LANG_TOGGLE_JS } from "./clientScript";
import { renderElementToString } from "./renderToString";

export interface RenderOptions {
  /** Résout le href d'une page à partir de son slug (preview vs publié). */
  linkFor: (slug: string) => string;
  /** Langue affichée initialement (le script peut ensuite basculer). */
  activeLang?: string;
  showPdf?: boolean;
  pdfHref?: string;
  /** Fige une seule langue (rendu PDF) : n'émet pas les autres. */
  onlyLang?: string;
  /** Mode de rendu : "online" (défaut) ou "print" (PDF). */
  mode?: "online" | "print";
  /** Profil actif à rendre ; `undefined` = utilise le profil actif du site. */
  profileId?: number | null;
}

/** Rendu React d'une page (utilisé par la preview Next.js). */
export function renderPageElement(
  full: FullSite,
  page: PageWithSections,
  opts: RenderOptions,
): ReactElement {
  const { component: Template } = getTemplate(full.site.templateId);
  const langs = opts.onlyLang ? [opts.onlyLang] : full.site.languages;
  const activeLang = opts.activeLang ?? full.site.defaultLanguage;
  const nav = buildNav(full.pages, page.type, opts.linkFor);
  const profileId =
    opts.profileId !== undefined ? opts.profileId : full.site.activeProfileId;
  return (
    <Template
      page={page}
      nav={nav}
      langs={langs}
      activeLang={activeLang}
      mode={opts.mode ?? "online"}
      ownerName={full.site.ownerName}
      photoUrl={full.site.photoUrl}
      profileId={profileId}
      showPdf={opts.showPdf}
      pdfHref={opts.pdfHref}
    />
  );
}

/** Document HTML complet et autonome (utilisé par la publication statique). */
export async function renderPageDocument(
  full: FullSite,
  page: PageWithSections,
  opts: RenderOptions,
): Promise<string> {
  const { css } = getTemplate(full.site.templateId);
  const activeLang = opts.activeLang ?? full.site.defaultLanguage;
  const body = await renderElementToString(renderPageElement(full, page, opts));
  const includeToggle = !opts.onlyLang;

  return `<!doctype html>
<html lang="${activeLang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(pageTitle(page))}</title>
<link rel="stylesheet" href="/assets/base.css">
<link rel="stylesheet" href="/assets/${css}">
${opts.onlyLang ? '<link rel="stylesheet" href="/assets/print.css" media="print">' : ""}
</head>
<body>
${body}
${includeToggle ? `<script>${LANG_TOGGLE_JS}</script>` : ""}
</body>
</html>`;
}

function pageTitle(page: PageWithSections): string {
  return page.type.charAt(0).toUpperCase() + page.type.slice(1);
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!,
  );
}

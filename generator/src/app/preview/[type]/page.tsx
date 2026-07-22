import { notFound } from "next/navigation";
import { getFullSite } from "@/lib/queries";
import { renderPageElement } from "@/lib/render";
import { getTemplate } from "@/templates";
import { LANG_TOGGLE_JS } from "@/lib/clientScript";

export const dynamic = "force-dynamic"; // toujours le contenu live (non publié)

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const full = await getFullSite();
  const page = full.pages.find((p) => p.type === type);
  if (!page) notFound();

  const { css } = getTemplate(full.site.templateId);
  const element = renderPageElement(full, page, {
    linkFor: (slug) => `/preview/${slug}`,
    activeLang: full.site.defaultLanguage,
    showPdf: page.type === "cv",
    pdfHref: `/api/pdf?lang=${full.site.defaultLanguage}`,
  });

  return (
    <>
      {/* Next hoiste ces balises dans le <head>. */}
      <link rel="stylesheet" href="/themes/base.css" />
      <link rel="stylesheet" href={`/themes/${css}`} />
      {element}
      <script dangerouslySetInnerHTML={{ __html: LANG_TOGGLE_JS }} />
    </>
  );
}

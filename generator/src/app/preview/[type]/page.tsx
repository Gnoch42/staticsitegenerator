import { notFound } from "next/navigation";
import { getFullSite } from "@/lib/queries";
import { renderPageElement } from "@/lib/render";
import { themeCssContent } from "@/lib/theme";
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

  // Couche thème inline (fichier intégré ou CSS généré depuis le YAML).
  const themeCss = await themeCssContent(full.template);
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
      <style dangerouslySetInnerHTML={{ __html: themeCss }} />
      {element}
      <script dangerouslySetInnerHTML={{ __html: LANG_TOGGLE_JS }} />
    </>
  );
}

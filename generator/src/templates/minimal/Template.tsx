import { SectionRenderer } from "@/components/render/SectionRenderer";
import { SiteHeader } from "@/components/render/SiteHeader";
import type { TemplateProps } from "../types";

/** Template minimaliste : une seule colonne centrée, beaucoup de blanc. */
export default function MinimalTemplate({
  page,
  nav,
  langs,
  activeLang,
  showPdf,
  pdfHref,
}: TemplateProps) {
  const ctx = { langs };
  return (
    <div className="site-root theme-minimal" data-active-lang={activeLang}>
      <SiteHeader nav={nav} langs={langs} showPdf={showPdf} pdfHref={pdfHref} />
      <main className="page page-minimal">
        {page.sections.map((s) => (
          <SectionRenderer key={s.id} section={s} ctx={ctx} />
        ))}
      </main>
    </div>
  );
}

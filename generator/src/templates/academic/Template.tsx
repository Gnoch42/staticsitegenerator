import { SectionRenderer } from "@/components/render/SectionRenderer";
import { SiteHeader } from "@/components/render/SiteHeader";
import type { TemplateProps } from "../types";

/**
 * Template académique : colonne unique, typographie sérif, pensée pour
 * mettre en valeur la page Publications (styles renforcés dans le CSS).
 */
export default function AcademicTemplate({
  page,
  nav,
  langs,
  activeLang,
  showPdf,
  pdfHref,
}: TemplateProps) {
  const ctx = { langs };
  return (
    <div className="site-root theme-academic" data-active-lang={activeLang}>
      <SiteHeader nav={nav} langs={langs} showPdf={showPdf} pdfHref={pdfHref} />
      <main className={`page page-academic page-${page.type}`}>
        {page.sections.map((s) => (
          <SectionRenderer key={s.id} section={s} ctx={ctx} />
        ))}
      </main>
    </div>
  );
}

import { SectionRenderer } from "@/components/render/SectionRenderer";
import { SiteHeader } from "@/components/render/SiteHeader";
import type { TemplateProps } from "../types";

/** Template moderne : accent coloré, en-tête large, une colonne aérée. */
export default function ModernTemplate({
  page,
  nav,
  langs,
  activeLang,
  mode,
  ownerName,
  showPdf,
  pdfHref,
}: TemplateProps) {
  const ctx = { langs, mode };
  return (
    <div className="site-root theme-modern" data-active-lang={activeLang}>
      <SiteHeader
        nav={nav}
        langs={langs}
        ownerName={ownerName}
        showPdf={showPdf}
        pdfHref={pdfHref}
      />
      <main className={`page page-modern page-${page.type}`}>
        {page.sections.map((s) => (
          <SectionRenderer key={s.id} section={s} ctx={ctx} />
        ))}
      </main>
    </div>
  );
}

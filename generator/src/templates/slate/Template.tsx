import { SectionRenderer } from "@/components/render/SectionRenderer";
import { SiteHeader } from "@/components/render/SiteHeader";
import { CvIdentity } from "@/components/render/CvIdentity";
import { SIDEBAR_SECTIONS } from "@/lib/types";
import type { TemplateProps } from "../types";

/** Template « slate » : sidebar sombre à gauche, colonne claire à droite (CV). */
export default function SlateTemplate({
  page,
  nav,
  langs,
  activeLang,
  mode,
  ownerName,
  photoUrl,
  profileId,
  showPdf,
  pdfHref,
}: TemplateProps) {
  const ctx = { langs, mode, profileId };
  const isCv = page.type === "cv";
  const sidebar = page.sections.filter((s) => SIDEBAR_SECTIONS.includes(s.type));
  const main = page.sections.filter((s) => !SIDEBAR_SECTIONS.includes(s.type));

  return (
    <div className="site-root theme-slate" data-active-lang={activeLang}>
      <SiteHeader
        nav={nav}
        langs={langs}
        ownerName={ownerName}
        showPdf={showPdf}
        pdfHref={pdfHref}
      />
      {isCv ? (
        <main className="page page-slate two-col">
          <aside className="col-sidebar">
            <CvIdentity ownerName={ownerName} photoUrl={photoUrl} />
            {sidebar.map((s) => (
              <SectionRenderer key={s.id} section={s} ctx={ctx} />
            ))}
          </aside>
          <div className="col-main">
            {main.map((s) => (
              <SectionRenderer key={s.id} section={s} ctx={ctx} />
            ))}
          </div>
        </main>
      ) : (
        <main className={`page page-slate page-${page.type}`}>
          {page.sections.map((s) => (
            <SectionRenderer key={s.id} section={s} ctx={ctx} />
          ))}
        </main>
      )}
    </div>
  );
}

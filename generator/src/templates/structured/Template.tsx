import { SectionRenderer } from "@/components/render/SectionRenderer";
import { SiteHeader } from "@/components/render/SiteHeader";
import { CvIdentity } from "@/components/render/CvIdentity";
import { SIDEBAR_SECTIONS } from "@/lib/types";
import type { TemplateProps } from "../types";

/**
 * Template structuré / corporate — implémente le wireframe de référence :
 * sidebar gauche (sections courtes) + colonne principale droite pour la
 * page CV. Les autres pages utilisent une seule colonne.
 */
export default function StructuredTemplate({
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

  const sidebar = page.sections.filter((s) =>
    SIDEBAR_SECTIONS.includes(s.type),
  );
  const main = page.sections.filter(
    (s) => !SIDEBAR_SECTIONS.includes(s.type),
  );

  return (
    <div className="site-root theme-structured" data-active-lang={activeLang}>
      <SiteHeader nav={nav} langs={langs} ownerName={ownerName} showPdf={showPdf} pdfHref={pdfHref} />
      {isCv ? (
        <main className="page page-structured two-col">
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
        <main className="page page-structured">
          {page.sections.map((s) => (
            <SectionRenderer key={s.id} section={s} ctx={ctx} />
          ))}
        </main>
      )}
    </div>
  );
}

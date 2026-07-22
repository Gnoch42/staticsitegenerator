import { SectionRenderer } from "@/components/render/SectionRenderer";
import { SiteHeader } from "@/components/render/SiteHeader";
import { CvIdentity } from "@/components/render/CvIdentity";
import type { TemplateProps } from "../types";

/** Template minimaliste : une seule colonne centrée, beaucoup de blanc. */
export default function MinimalTemplate({
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
  return (
    <div className="site-root theme-minimal" data-active-lang={activeLang}>
      <SiteHeader nav={nav} langs={langs} ownerName={ownerName} showPdf={showPdf} pdfHref={pdfHref} />
      <main className="page page-minimal">
        {page.type === "cv" && <CvIdentity ownerName={ownerName} photoUrl={photoUrl} />}
        {page.sections.map((s) => (
          <SectionRenderer key={s.id} section={s} ctx={ctx} />
        ))}
      </main>
    </div>
  );
}

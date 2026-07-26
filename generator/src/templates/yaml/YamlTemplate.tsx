import { SectionRenderer } from "@/components/render/SectionRenderer";
import { SiteHeader } from "@/components/render/SiteHeader";
import { CvIdentity } from "@/components/render/CvIdentity";
import { DEFAULT_CONFIG } from "@/lib/templateConfig";
import type { TemplateProps } from "../types";

/**
 * Template générique piloté par une config YAML. Le style est fourni par
 * le CSS généré (scopé `.theme-yaml`) ; ici on ne gère que la mise en
 * page : une ou deux colonnes, et quelles sections vont en sidebar.
 */
export default function YamlTemplate({
  page,
  nav,
  langs,
  activeLang,
  mode,
  ownerName,
  photoUrl,
  profileId,
  config,
  locale,
  showPdf,
  pdfHref,
}: TemplateProps) {
  const cfg = config ?? DEFAULT_CONFIG;
  const ctx = {
    langs,
    mode,
    profileId,
    locale: locale ?? null,
    ongoing: cfg.labels.ongoing,
  };
  const isCv = page.type === "cv";
  const twoCol = cfg.layout.type === "two-column" && isCv;

  const identity = <CvIdentity ownerName={ownerName} photoUrl={photoUrl} />;

  let body;
  if (twoCol) {
    const sidebar = page.sections.filter((s) =>
      cfg.layout.sidebar.includes(s.type),
    );
    const main = page.sections.filter(
      (s) => !cfg.layout.sidebar.includes(s.type),
    );
    const sidebarCol = (
      <aside className="col-sidebar" key="s">
        {identity}
        {sidebar.map((s) => (
          <SectionRenderer key={s.id} section={s} ctx={ctx} />
        ))}
      </aside>
    );
    const mainCol = (
      <div className="col-main" key="m">
        {main.map((s) => (
          <SectionRenderer key={s.id} section={s} ctx={ctx} />
        ))}
      </div>
    );
    // Sidebar toujours en 1er dans le DOM (le côté visuel est géré en CSS) :
    // requis pour que le flottant d'impression remplisse la largeur.
    body = (
      <main className="page two-col">
        {[sidebarCol, mainCol]}
      </main>
    );
  } else {
    body = (
      <main className={`page page-${page.type}`}>
        {isCv && identity}
        {page.sections.map((s) => (
          <SectionRenderer key={s.id} section={s} ctx={ctx} />
        ))}
      </main>
    );
  }

  return (
    <div className="site-root theme-yaml" data-active-lang={activeLang}>
      <SiteHeader
        nav={nav}
        langs={langs}
        ownerName={ownerName}
        showPdf={showPdf}
        pdfHref={pdfHref}
      />
      {body}
    </div>
  );
}

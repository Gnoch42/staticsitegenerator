import type { PageWithSections } from "@/lib/queries";
import { PAGE_LABELS } from "@/lib/i18n";
import { I18n } from "./I18n";

export interface NavLink {
  type: string;
  slug: string;
  href: string;
  active: boolean;
}

export function SiteHeader({
  nav,
  langs,
  showPdf,
  pdfHref,
}: {
  nav: NavLink[];
  langs: string[];
  showPdf?: boolean;
  pdfHref?: string;
}) {
  return (
    <header className="site-header">
      <nav className="site-nav">
        {nav.map((n) => (
          <a
            key={n.slug}
            href={n.href}
            className={`nav-link${n.active ? " active" : ""}`}
          >
            <I18n field={PAGE_LABELS[n.type]} langs={langs} />
          </a>
        ))}
      </nav>
      <div className="site-tools">
        <div className="lang-switch" role="group" aria-label="Langue">
          {langs.map((l) => (
            <button
              key={l}
              type="button"
              className="lang-btn"
              data-set-lang={l}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        {showPdf && pdfHref && (
          <a className="pdf-btn" href={pdfHref} download>
            PDF
          </a>
        )}
      </div>
    </header>
  );
}

/** Construit les liens de nav pour les pages activées. */
export function buildNav(
  pages: PageWithSections[],
  currentType: string,
  linkFor: (slug: string) => string,
): NavLink[] {
  return pages
    .filter((p) => p.enabled)
    .map((p) => ({
      type: p.type,
      slug: p.slug,
      href: linkFor(p.slug),
      active: p.type === currentType,
    }));
}

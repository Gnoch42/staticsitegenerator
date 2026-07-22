import type { PageWithSections } from "@/lib/queries";
import type { NavLink } from "@/components/render/SiteHeader";

/** Props communes reçues par les 3 templates. Aucun template n'a de
 *  logique métier : ils ne font qu'arranger visuellement ces données. */
export interface TemplateProps {
  page: PageWithSections;
  nav: NavLink[];
  langs: string[];
  activeLang: string;
  /** Mode de rendu : site en ligne ou version imprimée (PDF). */
  mode: "online" | "print";
  /** Nom affiché en en-tête (site + CV). */
  ownerName?: string | null;
  showPdf?: boolean;
  pdfHref?: string;
}

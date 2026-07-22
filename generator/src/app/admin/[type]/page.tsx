import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getFullSite } from "@/lib/queries";
import { SECTIONS_BY_PAGE, SECTION_LABELS } from "@/lib/types";
import type { PageType } from "@/lib/types";
import { PAGE_LABELS, t } from "@/lib/i18n";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageEditor } from "@/components/admin/PageEditor";

export const dynamic = "force-dynamic";

const VALID: PageType[] = ["cv", "video", "research", "contact"];

export default async function EditPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  await requireAuth();
  const { type } = await params;
  if (!VALID.includes(type as PageType)) notFound();

  const full = await getFullSite();
  const page = full.pages.find((p) => p.type === type);
  if (!page) notFound();

  const allowed = SECTIONS_BY_PAGE[type as PageType].map((st) => ({
    type: st,
    label: t(SECTION_LABELS[st], full.site.defaultLanguage),
  }));

  return (
    <AdminShell active={type}>
      <div className="admin-topbar" style={{ marginBottom: ".5rem" }}>
        <h2 style={{ margin: 0, fontSize: "1.05rem" }}>
          {t(PAGE_LABELS[type], full.site.defaultLanguage)}
        </h2>
        {type === "cv" && (
          <a
            className="btn btn-sm"
            href={`/api/pdf?lang=${full.site.defaultLanguage}`}
          >
            Télécharger le CV en PDF
          </a>
        )}
      </div>

      <PageEditor
        pageId={page.id}
        pageType={page.type}
        initialSections={page.sections.map((s) => ({
          id: s.id,
          type: s.type,
          enabled: s.enabled,
          title: s.title ?? {},
          items: s.items.map((it) => ({ id: it.id, data: it.data })),
        }))}
        langs={full.site.languages}
        defaultLang={full.site.defaultLanguage}
        allowedSectionTypes={allowed}
      />
    </AdminShell>
  );
}

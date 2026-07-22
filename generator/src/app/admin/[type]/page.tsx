import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getFullSite } from "@/lib/queries";
import { SECTIONS_BY_PAGE, SECTION_LABELS } from "@/lib/types";
import type { PageType } from "@/lib/types";
import { PAGE_LABELS, t } from "@/lib/i18n";
import { tAdmin, type AdminLang } from "@/lib/adminI18n";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageEditor } from "@/components/admin/PageEditor";

export const dynamic = "force-dynamic";

const VALID: PageType[] = ["cv", "video", "research", "portfolio", "contact"];

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

  const lang = full.site.adminLanguage as AdminLang;
  const allowed = SECTIONS_BY_PAGE[type as PageType].map((st) => ({
    type: st,
    label: t(SECTION_LABELS[st], full.site.defaultLanguage),
  }));

  return (
    <AdminShell active={type} lang={lang}>
      <div className="admin-topbar" style={{ marginBottom: ".5rem" }}>
        <h2 style={{ margin: 0, fontSize: "1.05rem" }}>
          {t(PAGE_LABELS[type], full.site.defaultLanguage)}
        </h2>
        {type === "cv" && (
          <a className="btn btn-sm" href={`/api/pdf?lang=${full.site.defaultLanguage}`}>
            {tAdmin("pdf_download", lang)}
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
          visibility: s.visibility ?? "both",
          items: s.items.map((it) => ({
            id: it.id,
            data: it.data,
            visibility: it.visibility ?? "both",
            profileIds: it.profileIds,
          })),
        }))}
        langs={full.site.languages}
        defaultLang={full.site.defaultLanguage}
        allowedSectionTypes={allowed}
        profiles={full.profiles.map((p) => ({ id: p.id, name: p.name }))}
      />
    </AdminShell>
  );
}

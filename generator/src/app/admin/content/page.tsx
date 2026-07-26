import { requireAuth } from "@/lib/auth";
import { getFullSite } from "@/lib/queries";
import { buildContentYaml } from "@/lib/contentYaml";
import type { AdminLang } from "@/lib/adminI18n";
import { AdminShell } from "@/components/admin/AdminShell";
import { ContentYamlEditor } from "@/components/admin/ContentYamlEditor";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  await requireAuth();
  const full = await getFullSite();
  const lang = full.site.adminLanguage as AdminLang;
  const yaml = buildContentYaml(full);

  return (
    <AdminShell active="content" lang={lang}>
      <ContentYamlEditor
        initial={yaml}
        profiles={full.profiles.map((p) => ({ id: p.id, name: p.name }))}
      />
    </AdminShell>
  );
}

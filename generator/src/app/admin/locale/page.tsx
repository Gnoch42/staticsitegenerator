import { requireAuth } from "@/lib/auth";
import { getFullSite } from "@/lib/queries";
import { buildLocaleYaml } from "@/lib/locale";
import { tAdmin, type AdminLang } from "@/lib/adminI18n";
import { AdminShell } from "@/components/admin/AdminShell";
import { YamlSurface } from "@/components/admin/YamlSurface";
import { importLocaleYaml } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function LocalePage() {
  await requireAuth();
  const full = await getFullSite();
  const lang = full.site.adminLanguage as AdminLang;
  const yaml = buildLocaleYaml(full.site.locale, full.site.languages);

  return (
    <AdminShell active="locale" lang={lang}>
      <YamlSurface
        kind="locale"
        initial={yaml}
        title={tAdmin("locale_title", lang)}
        hint={tAdmin("locale_hint", lang)}
        confirmMsg={tAdmin("locale_confirm", lang)}
        filename="locale.yaml"
        reloadHref="/admin/locale"
        save={importLocaleYaml}
      />
    </AdminShell>
  );
}

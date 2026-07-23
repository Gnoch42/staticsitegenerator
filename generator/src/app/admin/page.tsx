import { requireAuth } from "@/lib/auth";
import { getFullSite } from "@/lib/queries";
import { PAGE_LABELS, t } from "@/lib/i18n";
import { tAdmin, type AdminLang } from "@/lib/adminI18n";
import { AdminShell } from "@/components/admin/AdminShell";
import { TemplateSelector } from "@/components/admin/TemplateSelector";
import { LanguageSettings } from "@/components/admin/LanguageSettings";
import { OwnerNameField } from "@/components/admin/OwnerNameField";
import { PhotoField } from "@/components/admin/PhotoField";
import { AdminLanguageSelect } from "@/components/admin/AdminLanguageSelect";
import { PageToggles } from "@/components/admin/PageToggles";
import { ProfilesManager } from "@/components/admin/ProfilesManager";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  await requireAuth();
  const full = await getFullSite();
  const lang = full.site.adminLanguage as AdminLang;
  const at = (k: string) => tAdmin(k, lang);

  return (
    <AdminShell active="settings" lang={lang}>
      <div className="card">
        <div className="card-head">
          <span className="card-title">{at("identity_title")}</span>
        </div>
        <OwnerNameField initial={full.site.ownerName ?? ""} />
        <PhotoField
          initial={full.site.photoUrl ?? ""}
          profiles={full.profiles.map((p) => ({ id: p.id, name: p.name }))}
          photoProfileIds={full.site.photoProfileIds ?? []}
        />
      </div>

      <div className="card">
        <div className="card-head">
          <span className="card-title">{at("profiles_title")}</span>
        </div>
        <ProfilesManager
          profiles={full.profiles}
          activeProfileId={full.site.activeProfileId ?? null}
        />
      </div>

      <div className="card">
        <div className="card-head">
          <span className="card-title">{at("template_title")}</span>
        </div>
        <p className="muted">{at("template_hint")}</p>
        <TemplateSelector templates={full.templates} current={full.site.templateId} />
      </div>

      <div className="card">
        <div className="card-head">
          <span className="card-title">{at("langs_title")}</span>
        </div>
        <LanguageSettings
          languages={full.site.languages}
          defaultLanguage={full.site.defaultLanguage}
        />
      </div>

      <div className="card">
        <div className="card-head">
          <span className="card-title">{at("adminlang_title")}</span>
        </div>
        <p className="muted">{at("adminlang_hint")}</p>
        <AdminLanguageSelect initial={lang} />
      </div>

      <div className="card">
        <div className="card-head">
          <span className="card-title">{at("pages_title")}</span>
        </div>
        <PageToggles
          pages={full.pages.map((p) => ({
            id: p.id,
            type: p.type,
            label: t(PAGE_LABELS[p.type], full.site.defaultLanguage),
            enabled: p.enabled,
            sectionCount: p.sections.length,
          }))}
        />
      </div>
    </AdminShell>
  );
}

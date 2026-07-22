import { requireAuth } from "@/lib/auth";
import { getFullSite } from "@/lib/queries";
import { PAGE_LABELS, t } from "@/lib/i18n";
import { AdminShell } from "@/components/admin/AdminShell";
import { TemplateSelector } from "@/components/admin/TemplateSelector";
import { LanguageSettings } from "@/components/admin/LanguageSettings";
import { PublishBar } from "@/components/admin/PublishBar";
import { OwnerNameField } from "@/components/admin/OwnerNameField";
import { PageToggles } from "@/components/admin/PageToggles";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  await requireAuth();
  const full = await getFullSite();

  return (
    <AdminShell active="settings">
      <PublishBar
        publishedAt={full.site.publishedAt?.toISOString() ?? null}
      />

      <div className="card">
        <div className="card-head">
          <span className="card-title">Nom / identité</span>
        </div>
        <OwnerNameField initial={full.site.ownerName ?? ""} />
      </div>

      <div className="card">
        <div className="card-head">
          <span className="card-title">Template</span>
        </div>
        <p className="muted">
          Appliqué immédiatement — l&apos;aperçu se met à jour sans republier.
        </p>
        <TemplateSelector
          templates={full.templates}
          current={full.site.templateId}
        />
      </div>

      <div className="card">
        <div className="card-head">
          <span className="card-title">Langues</span>
        </div>
        <LanguageSettings
          languages={full.site.languages}
          defaultLanguage={full.site.defaultLanguage}
        />
      </div>

      <div className="card">
        <div className="card-head">
          <span className="card-title">Pages / onglets</span>
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

import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { getFullSite } from "@/lib/queries";
import { PAGE_LABELS, t } from "@/lib/i18n";
import { AdminShell } from "@/components/admin/AdminShell";
import { TemplateSelector } from "@/components/admin/TemplateSelector";
import { LanguageSettings } from "@/components/admin/LanguageSettings";
import { PublishBar } from "@/components/admin/PublishBar";

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
          <span className="card-title">Pages</span>
        </div>
        <p className="muted">Cliquez pour éditer le contenu de chaque page.</p>
        <div className="template-grid">
          {full.pages.map((p) => (
            <Link
              key={p.id}
              href={`/admin/${p.type}`}
              className="template-option"
            >
              <div className="card-title">
                {t(PAGE_LABELS[p.type], full.site.defaultLanguage)}
              </div>
              <div className="muted">
                {p.sections.length} section(s) ·{" "}
                {p.enabled ? "activée" : "désactivée"}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}

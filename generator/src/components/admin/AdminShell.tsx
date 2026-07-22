import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";
import { tAdmin, type AdminLang } from "@/lib/adminI18n";
import { AdminI18nProvider } from "./AdminI18n";

const TABS = [
  { href: "/admin", key: "settings", label: "tab_settings" },
  { href: "/admin/cv", key: "cv", label: "tab_cv" },
  { href: "/admin/video", key: "video", label: "tab_video" },
  { href: "/admin/research", key: "research", label: "tab_research" },
  { href: "/admin/portfolio", key: "portfolio", label: "tab_portfolio" },
  { href: "/admin/contact", key: "contact", label: "tab_contact" },
];

export function AdminShell({
  active,
  lang,
  children,
}: {
  active: string;
  lang: AdminLang;
  children: React.ReactNode;
}) {
  const t = (k: string) => tAdmin(k, lang);
  return (
    <AdminI18nProvider lang={lang}>
      <div className="admin-shell">
        <div className="admin-topbar">
          <h1>{t("app_title")}</h1>
          <div className="toolbar">
            <a className="btn btn-sm" href="/preview" target="_blank" rel="noreferrer">
              {t("preview")} ↗
            </a>
            <form action={logoutAction}>
              <button className="btn btn-sm" type="submit">
                {t("logout")}
              </button>
            </form>
          </div>
        </div>
        <nav className="admin-tabs">
          {TABS.map((tab) => (
            <Link
              key={tab.key}
              href={tab.href}
              className={`admin-tab${active === tab.key ? " active" : ""}`}
            >
              {t(tab.label)}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </AdminI18nProvider>
  );
}

import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";

const TABS = [
  { href: "/admin", key: "settings", label: "Réglages" },
  { href: "/admin/cv", key: "cv", label: "CV" },
  { href: "/admin/video", key: "video", label: "Vidéo" },
  { href: "/admin/research", key: "research", label: "Publications" },
  { href: "/admin/contact", key: "contact", label: "Contact" },
];

export function AdminShell({
  active,
  children,
}: {
  active: string;
  children: React.ReactNode;
}) {
  return (
    <div className="admin-shell">
      <div className="admin-topbar">
        <h1>Éditeur du site CV</h1>
        <div className="toolbar">
          <a className="btn btn-sm" href="/preview" target="_blank" rel="noreferrer">
            Aperçu ↗
          </a>
          <form action={logoutAction}>
            <button className="btn btn-sm" type="submit">
              Déconnexion
            </button>
          </form>
        </div>
      </div>
      <nav className="admin-tabs">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            className={`admin-tab${active === t.key ? " active" : ""}`}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}

import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getFullSite } from "@/lib/queries";
import { tAdmin, type AdminLang } from "@/lib/adminI18n";
import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isAuthenticated()) redirect("/admin");
  const full = await getFullSite();
  const lang = full.site.adminLanguage as AdminLang;
  const t = (k: string) => tAdmin(k, lang);

  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1 style={{ marginTop: 0, fontSize: "1.15rem" }}>{t("login_title")}</h1>
        <p className="muted">{t("login_sub")}</p>
        <LoginForm lang={lang} />
      </div>
    </div>
  );
}

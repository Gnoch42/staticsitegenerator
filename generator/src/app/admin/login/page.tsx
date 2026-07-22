import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isAuthenticated()) redirect("/admin");
  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1 style={{ marginTop: 0, fontSize: "1.15rem" }}>Connexion</h1>
        <p className="muted">Accès à l&apos;éditeur du site.</p>
        <LoginForm />
      </div>
    </div>
  );
}

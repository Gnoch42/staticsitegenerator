"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setAdminLanguage } from "@/app/admin/actions";
import type { AdminLang } from "@/lib/adminI18n";

export function AdminLanguageSelect({ initial }: { initial: AdminLang }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function change(lang: string) {
    startTransition(async () => {
      await setAdminLanguage(lang);
      router.refresh(); // recharge l'UI dans la nouvelle langue
    });
  }

  return (
    <select
      value={initial}
      disabled={pending}
      onChange={(e) => change(e.target.value)}
      style={{ maxWidth: 240 }}
    >
      <option value="fr">Français</option>
      <option value="en">English</option>
    </select>
  );
}

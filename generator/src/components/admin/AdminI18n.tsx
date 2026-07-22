"use client";

import { createContext, useContext } from "react";
import { tAdmin, type AdminLang } from "@/lib/adminI18n";

const Ctx = createContext<AdminLang>("fr");

export function AdminI18nProvider({
  lang,
  children,
}: {
  lang: AdminLang;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={lang}>{children}</Ctx.Provider>;
}

/** Hook de traduction pour les composants client de l'admin. */
export function useAdminT() {
  const lang = useContext(Ctx);
  return (key: string) => tAdmin(key, lang);
}

export function useAdminLang() {
  return useContext(Ctx);
}

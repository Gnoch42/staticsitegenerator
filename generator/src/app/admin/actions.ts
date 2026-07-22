"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { site, sections, items } from "@/db/schema";
import {
  verifyPassword,
  createSession,
  destroySession,
  isAuthenticated,
} from "@/lib/auth";
import { isSectionAllowed } from "@/lib/types";
import type { SectionType, Multilingual, ItemData } from "@/lib/types";
import { defaultItemData } from "@/lib/itemDefaults";
import { publishSite } from "@/lib/publish";
import { translateContent } from "@/lib/translate";

async function guard() {
  if (!(await isAuthenticated())) throw new Error("Non authentifié");
}

// ── Authentification ──
export async function loginAction(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const password = String(formData.get("password") ?? "");
  if (!verifyPassword(password)) {
    return { error: "Mot de passe incorrect." };
  }
  await createSession();
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

// ── Réglages du site ──
export async function setTemplate(templateId: string) {
  await guard();
  db.update(site).set({ templateId }).where(eq(site.id, 1)).run();
  revalidatePath("/admin", "layout");
}

export async function setLanguages(languages: string[], defaultLanguage: string) {
  await guard();
  const langs = languages.filter(Boolean);
  const def = langs.includes(defaultLanguage) ? defaultLanguage : langs[0];
  db.update(site)
    .set({ languages: langs, defaultLanguage: def })
    .where(eq(site.id, 1))
    .run();
  revalidatePath("/admin", "layout");
}

// ── Sections ──
export async function addSection(
  pageId: number,
  type: SectionType,
  pageType: string,
) {
  await guard();
  if (!isSectionAllowed(pageType as never, type)) {
    throw new Error(`Section ${type} non autorisée sur la page ${pageType}`);
  }
  const max = db
    .select({ v: sql<number>`coalesce(max(${sections.position}), -1)` })
    .from(sections)
    .where(eq(sections.pageId, pageId))
    .get();
  const res = db
    .insert(sections)
    .values({ pageId, type, position: (max?.v ?? -1) + 1 })
    .run();
  revalidatePath("/admin", "layout");
  return { id: Number(res.lastInsertRowid) };
}

export async function updateSection(
  id: number,
  patch: { enabled?: boolean; title?: Multilingual },
) {
  await guard();
  db.update(sections).set(patch).where(eq(sections.id, id)).run();
  revalidatePath("/admin", "layout");
}

export async function deleteSection(id: number) {
  await guard();
  db.delete(sections).where(eq(sections.id, id)).run();
  revalidatePath("/admin", "layout");
}

export async function reorderSections(ids: number[]) {
  await guard();
  db.transaction((tx) => {
    ids.forEach((id, i) => {
      tx.update(sections).set({ position: i }).where(eq(sections.id, id)).run();
    });
  });
  revalidatePath("/admin", "layout");
}

// ── Items ──
export async function addItem(sectionId: number, type: SectionType, langs: string[]) {
  await guard();
  const max = db
    .select({ v: sql<number>`coalesce(max(${items.position}), -1)` })
    .from(items)
    .where(eq(items.sectionId, sectionId))
    .get();
  const res = db
    .insert(items)
    .values({
      sectionId,
      position: (max?.v ?? -1) + 1,
      data: defaultItemData(type, langs),
    })
    .run();
  revalidatePath("/admin", "layout");
  return { id: Number(res.lastInsertRowid) };
}

export async function updateItem(id: number, data: ItemData) {
  await guard();
  db.update(items).set({ data }).where(eq(items.id, id)).run();
  revalidatePath("/admin", "layout");
}

export async function deleteItem(id: number) {
  await guard();
  db.delete(items).where(eq(items.id, id)).run();
  revalidatePath("/admin", "layout");
}

export async function reorderItems(ids: number[]) {
  await guard();
  db.transaction((tx) => {
    ids.forEach((id, i) => {
      tx.update(items).set({ position: i }).where(eq(items.id, id)).run();
    });
  });
  revalidatePath("/admin", "layout");
}

// ── Traduction (point d'extension) ──
export async function translateAction(text: string, from: string, to: string) {
  await guard();
  const res = await translateContent({ text, from, to });
  return res.text;
}

// ── Publication ──
export async function publishAction() {
  await guard();
  const result = await publishSite();
  revalidatePath("/admin", "layout");
  return {
    pages: result.pages,
    publishedAt: result.publishedAt.toISOString(),
  };
}

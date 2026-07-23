"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql, and } from "drizzle-orm";
import { db } from "@/db/client";
import {
  site,
  pages,
  sections,
  items,
  profiles,
  itemProfiles,
} from "@/db/schema";
import {
  verifyPassword,
  createSession,
  destroySession,
  isAuthenticated,
} from "@/lib/auth";
import { isSectionAllowed } from "@/lib/types";
import type { SectionType, Multilingual, ItemData, Visibility } from "@/lib/types";
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
    return { error: "invalid" };
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

export async function setOwnerName(ownerName: string) {
  await guard();
  db.update(site)
    .set({ ownerName: ownerName.trim() || null })
    .where(eq(site.id, 1))
    .run();
  revalidatePath("/admin", "layout");
}

export async function setPhotoUrl(photoUrl: string) {
  await guard();
  db.update(site)
    .set({ photoUrl: photoUrl.trim() || null })
    .where(eq(site.id, 1))
    .run();
  revalidatePath("/admin", "layout");
}

/** Profils où la photo apparaît (vide = tous, comme les items). */
export async function setPhotoProfiles(profileIds: number[]) {
  await guard();
  db.update(site)
    .set({ photoProfileIds: profileIds })
    .where(eq(site.id, 1))
    .run();
  revalidatePath("/admin", "layout");
}

export async function setAdminLanguage(adminLanguage: string) {
  await guard();
  const lang = adminLanguage === "en" ? "en" : "fr";
  db.update(site).set({ adminLanguage: lang }).where(eq(site.id, 1)).run();
  revalidatePath("/admin", "layout");
}

// ── Profils de CV ──
function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "profil"
  );
}

export async function createProfile(name: string) {
  await guard();
  const clean = name.trim() || "Nouveau profil";
  const max = db
    .select({ v: sql<number>`coalesce(max(${profiles.position}), -1)` })
    .from(profiles)
    .get();
  const res = db
    .insert(profiles)
    .values({ name: clean, slug: slugify(clean), position: (max?.v ?? -1) + 1 })
    .run();
  revalidatePath("/admin", "layout");
  return { id: Number(res.lastInsertRowid) };
}

export async function renameProfile(id: number, name: string) {
  await guard();
  const clean = name.trim() || "Profil";
  db.update(profiles)
    .set({ name: clean, slug: slugify(clean) })
    .where(eq(profiles.id, id))
    .run();
  revalidatePath("/admin", "layout");
}

export async function deleteProfile(id: number) {
  await guard();
  db.delete(profiles).where(eq(profiles.id, id)).run();
  // Si c'était le profil actif, revenir au CV complet.
  db.update(site)
    .set({ activeProfileId: null })
    .where(and(eq(site.id, 1), eq(site.activeProfileId, id)))
    .run();
  revalidatePath("/admin", "layout");
}

/** Profil actif utilisé à la publication et au PDF (null = CV complet). */
export async function setActiveProfile(profileId: number | null) {
  await guard();
  db.update(site).set({ activeProfileId: profileId }).where(eq(site.id, 1)).run();
  revalidatePath("/admin", "layout");
}

/** Remplace l'ensemble des profils associés à un item. */
export async function setItemProfiles(itemId: number, profileIds: number[]) {
  await guard();
  db.transaction((tx) => {
    tx.delete(itemProfiles).where(eq(itemProfiles.itemId, itemId)).run();
    for (const pid of profileIds) {
      tx.insert(itemProfiles).values({ itemId, profileId: pid }).run();
    }
  });
  revalidatePath("/admin", "layout");
}

// ── Pages : activer / désactiver un onglet ──
export async function setPageEnabled(pageId: number, enabled: boolean) {
  await guard();
  db.update(pages).set({ enabled }).where(eq(pages.id, pageId)).run();
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
  patch: { enabled?: boolean; title?: Multilingual; visibility?: Visibility },
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

export async function setItemVisibility(id: number, visibility: Visibility) {
  await guard();
  db.update(items).set({ visibility }).where(eq(items.id, id)).run();
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

import { sqliteTable, integer, text, primaryKey } from "drizzle-orm/sqlite-core";
import type {
  Multilingual,
  ItemData,
  SectionType,
  PageType,
  Visibility,
} from "@/lib/types";

// ── templates : données de seed, non éditables par l'utilisateur ──
export const templates = sqliteTable("templates", {
  id: text("id").primaryKey(), // "minimal" | "structured" | "academic"
  name: text("name").notNull(),
  previewUrl: text("preview_url"),
});

// ── site : une seule ligne (id = 1) ──
export const site = sqliteTable("site", {
  id: integer("id").primaryKey(),
  templateId: text("template_id")
    .notNull()
    .references(() => templates.id),
  languages: text("languages", { mode: "json" }).$type<string[]>().notNull(),
  defaultLanguage: text("default_language").notNull(),
  ownerName: text("owner_name"),
  photoUrl: text("photo_url"),
  photoProfileIds: text("photo_profile_ids", { mode: "json" }).$type<number[]>(),
  adminLanguage: text("admin_language").notNull().default("fr"),
  activeProfileId: integer("active_profile_id"),
  publishedAt: integer("published_at", { mode: "timestamp" }),
});

// ── profiles : variantes ciblées du CV (entreprise/poste) ──
export const profiles = sqliteTable("profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  position: integer("position").notNull().default(0),
});

// ── item_profiles : association plusieurs-à-plusieurs item ↔ profil ──
export const itemProfiles = sqliteTable(
  "item_profiles",
  {
    itemId: integer("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    profileId: integer("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
  },
  (t) => ({ pk: primaryKey({ columns: [t.itemId, t.profileId] }) }),
);

// ── pages : les 4 pages du site ──
export const pages = sqliteTable("pages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").$type<PageType>().notNull(),
  slug: text("slug").notNull(),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  position: integer("position").notNull().default(0),
});

// ── sections : blocs d'une page, réordonnables / activables ──
export const sections = sqliteTable("sections", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pageId: integer("page_id")
    .notNull()
    .references(() => pages.id, { onDelete: "cascade" }),
  type: text("type").$type<SectionType>().notNull(),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  position: integer("position").notNull().default(0),
  title: text("title", { mode: "json" }).$type<Multilingual>(),
  visibility: text("visibility").$type<Visibility>().notNull().default("both"),
});

// ── items : entrées d'une section (data JSON libre selon le type) ──
export const items = sqliteTable("items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sectionId: integer("section_id")
    .notNull()
    .references(() => sections.id, { onDelete: "cascade" }),
  position: integer("position").notNull().default(0),
  data: text("data", { mode: "json" }).$type<ItemData>().notNull(),
  visibility: text("visibility").$type<Visibility>().notNull().default("both"),
});

// ── Types inférés ──
export type Template = typeof templates.$inferSelect;
export type Site = typeof site.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type Section = typeof sections.$inferSelect;
export type Item = typeof items.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type ItemProfile = typeof itemProfiles.$inferSelect;

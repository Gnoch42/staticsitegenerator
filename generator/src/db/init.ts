import type BetterSqlite3 from "better-sqlite3";
import { BUILTIN_TEMPLATES, REMOVED_TEMPLATE_IDS } from "./builtinTemplates";

// ─────────────────────────────────────────────────────────────
//  Bootstrap idempotent : crée le schéma et sème les données de
//  base. Conçu pour un démarrage à froid rapide (cycle Start/Stop
//  Coolify) : si la DB existe déjà, tout est CREATE/INSERT IF NOT
//  EXISTS / OR IGNORE — aucune étape lourde.
//
//  Pour l'évolution de schéma en dev : `npm run db:generate`
//  (drizzle-kit) produit des migrations versionnées dans ./drizzle.
// ─────────────────────────────────────────────────────────────

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS templates (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  preview_url TEXT,
  yaml        TEXT
);

CREATE TABLE IF NOT EXISTS site (
  id                INTEGER PRIMARY KEY,
  template_id       TEXT NOT NULL REFERENCES templates(id),
  languages         TEXT NOT NULL,
  default_language  TEXT NOT NULL,
  owner_name         TEXT,
  photo_url          TEXT,
  photo_profile_ids  TEXT,
  admin_language     TEXT NOT NULL DEFAULT 'fr',
  active_profile_id  INTEGER,
  published_at       INTEGER
);

CREATE TABLE IF NOT EXISTS pages (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  type     TEXT NOT NULL,
  slug     TEXT NOT NULL,
  enabled  INTEGER NOT NULL DEFAULT 1,
  position INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sections (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id    INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  enabled    INTEGER NOT NULL DEFAULT 1,
  position   INTEGER NOT NULL DEFAULT 0,
  title      TEXT,
  visibility TEXT NOT NULL DEFAULT 'both'
);

CREATE TABLE IF NOT EXISTS items (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  section_id INTEGER NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  position   INTEGER NOT NULL DEFAULT 0,
  data       TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'both'
);

CREATE TABLE IF NOT EXISTS profiles (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  name     TEXT NOT NULL,
  slug     TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS item_profiles (
  item_id    INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_sections_page ON sections(page_id);
CREATE INDEX IF NOT EXISTS idx_items_section ON items(section_id);
CREATE INDEX IF NOT EXISTS idx_item_profiles_item ON item_profiles(item_id);
CREATE INDEX IF NOT EXISTS idx_item_profiles_profile ON item_profiles(profile_id);
`;

export function bootstrapDatabase(conn: BetterSqlite3.Database): void {
  conn.exec(SCHEMA_SQL);
  migrate(conn);
  seed(conn);
}

// ── Migration idempotente pour les bases déjà existantes ──
// (ALTER TABLE ADD COLUMN n'a pas de "IF NOT EXISTS" en SQLite)
function migrate(conn: BetterSqlite3.Database): void {
  const hasColumn = (table: string, column: string): boolean => {
    const cols = conn
      .prepare(`PRAGMA table_info(${table})`)
      .all() as { name: string }[];
    return cols.some((c) => c.name === column);
  };
  const addColumn = (table: string, column: string, ddl: string) => {
    if (!hasColumn(table, column)) {
      conn.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${ddl}`);
    }
  };

  addColumn("templates", "yaml", "TEXT");
  addColumn("site", "owner_name", "TEXT");
  addColumn("site", "photo_url", "TEXT");
  addColumn("site", "photo_profile_ids", "TEXT");
  addColumn("site", "admin_language", "TEXT NOT NULL DEFAULT 'fr'");
  addColumn("site", "active_profile_id", "INTEGER");
  addColumn("sections", "visibility", "TEXT NOT NULL DEFAULT 'both'");
  addColumn("items", "visibility", "TEXT NOT NULL DEFAULT 'both'");

  // Ajoute la page portfolio si une base existante ne l'a pas encore.
  const site = conn.prepare(`SELECT 1 FROM site WHERE id = 1`).get();
  const portfolio = conn
    .prepare(`SELECT 1 FROM pages WHERE type = 'portfolio'`)
    .get();
  if (site && !portfolio) {
    const maxPos = conn
      .prepare(`SELECT COALESCE(MAX(position), -1) AS m FROM pages`)
      .get() as { m: number };
    const res = conn
      .prepare(
        `INSERT INTO pages (type, slug, enabled, position) VALUES ('portfolio', 'portfolio', 1, ?)`,
      )
      .run(maxPos.m + 1);
    conn
      .prepare(
        `INSERT INTO sections (page_id, type, enabled, position, title, visibility)
         VALUES (?, 'portfolio_gallery', 1, 0, ?, 'both')`,
      )
      .run(res.lastInsertRowid as number, JSON.stringify({ fr: "Portfolio", en: "Portfolio" }));
  }

  // Ajoute la page d'accueil (en 1re position) si une base existante ne l'a pas.
  const home = conn.prepare(`SELECT 1 FROM pages WHERE type = 'home'`).get();
  if (site && !home) {
    const minPos = conn
      .prepare(`SELECT COALESCE(MIN(position), 0) AS m FROM pages`)
      .get() as { m: number };
    const res = conn
      .prepare(
        `INSERT INTO pages (type, slug, enabled, position) VALUES ('home', 'home', 1, ?)`,
      )
      .run(minPos.m - 1);
    const secRes = conn
      .prepare(
        `INSERT INTO sections (page_id, type, enabled, position, title, visibility)
         VALUES (?, 'custom', 1, 0, ?, 'both')`,
      )
      .run(res.lastInsertRowid as number, JSON.stringify({ fr: "Bienvenue", en: "Welcome" }));
    conn
      .prepare(`INSERT INTO items (section_id, position, data) VALUES (?, 0, ?)`)
      .run(
        secRes.lastInsertRowid as number,
        JSON.stringify({
          fr: { heading: "Bonjour 👋", body: "Page d'accueil à personnaliser." },
          en: { heading: "Hello 👋", body: "Customize this home page." },
        }),
      );
  }
}

// ── Seed : templates (toujours à jour) + contenu de départ (si vide) ──
function seed(conn: BetterSqlite3.Database): void {
  // Les 5 templates de base sont désormais du YAML. Sur conflit, on ne
  // remplace le YAML QUE s'il est absent (COALESCE) : les modifications
  // faites par l'utilisateur dans l'admin ne sont jamais écrasées au boot.
  const insertTemplate = conn.prepare(
    `INSERT INTO templates (id, name, preview_url, yaml)
     VALUES (@id, @name, @previewUrl, @yaml)
     ON CONFLICT(id) DO UPDATE SET
       preview_url = excluded.preview_url,
       yaml = COALESCE(templates.yaml, excluded.yaml)`,
  );
  for (const t of BUILTIN_TEMPLATES) insertTemplate.run(t);

  // Retrait des anciens templates de base (minimal/modern/slate).
  const del = conn.prepare(`DELETE FROM templates WHERE id = ?`);
  for (const id of REMOVED_TEMPLATE_IDS) del.run(id);
  // Si le template actif n'existe plus, revenir à "structured".
  conn
    .prepare(
      `UPDATE site SET template_id = 'structured'
       WHERE id = 1 AND template_id NOT IN (SELECT id FROM templates)`,
    )
    .run();

  // Le reste du seed n'a lieu qu'au tout premier démarrage.
  const siteExists = conn.prepare(`SELECT 1 FROM site WHERE id = 1`).get();
  if (siteExists) return;

  const seedContent = conn.transaction(() => {
    conn
      .prepare(
        `INSERT INTO site (id, template_id, languages, default_language, published_at)
         VALUES (1, 'structured', '["fr","en"]', 'fr', NULL)`,
      )
      .run();

    const insertPage = conn.prepare(
      `INSERT INTO pages (type, slug, enabled, position) VALUES (?, ?, 1, ?)`,
    );
    const insertSection = conn.prepare(
      `INSERT INTO sections (page_id, type, enabled, position, title) VALUES (?, ?, 1, ?, ?)`,
    );
    const insertItem = conn.prepare(
      `INSERT INTO items (section_id, position, data) VALUES (?, ?, ?)`,
    );

    for (const page of DEFAULT_PAGES) {
      const { lastInsertRowid: pageId } = insertPage.run(
        page.type,
        page.slug,
        page.position,
      );
      page.sections.forEach((s, i) => {
        const { lastInsertRowid: sectionId } = insertSection.run(
          pageId as number,
          s.type,
          i,
          s.title ? JSON.stringify(s.title) : null,
        );
        (s.items ?? []).forEach((item, j) => {
          insertItem.run(sectionId as number, j, JSON.stringify(item));
        });
      });
    }
  });

  seedContent();
}

// ── Données de seed ──

const DEFAULT_PAGES = [
  {
    type: "home",
    slug: "home",
    position: 0,
    sections: [
      {
        type: "custom",
        title: { fr: "Bienvenue", en: "Welcome" },
        items: [
          {
            fr: { heading: "Bonjour 👋", body: "Page d'accueil à personnaliser — ajoutez du texte, des images, des boutons, une vidéo…" },
            en: { heading: "Hello 👋", body: "Customize this home page — add text, images, buttons, a video…" },
          },
        ],
      },
    ],
  },
  {
    type: "cv",
    slug: "cv",
    position: 1,
    sections: [
      {
        type: "contact",
        title: { fr: "Coordonnées", en: "Contact" },
        items: [
          {
            kind: "email",
            label: { fr: "Courriel", en: "Email" },
            value: "prenom@domaine.com",
          },
          {
            kind: "location",
            label: { fr: "Ville", en: "City" },
            value: "Montréal, QC",
          },
        ],
      },
      {
        type: "summary",
        title: { fr: "Résumé", en: "Summary" },
        items: [
          {
            fr: { text: "Professionnel·le motivé·e — à personnaliser." },
            en: { text: "Motivated professional — customize me." },
          },
        ],
      },
      {
        type: "experience",
        title: { fr: "Expériences", en: "Experience" },
        items: [
          {
            start_date: "2022-03",
            end_date: "2024-06",
            fr: {
              title: "Développeur backend",
              organization: "Acme Inc.",
              location: "Montréal, QC",
              description: "Description à personnaliser.",
            },
            en: {
              title: "Backend Developer",
              organization: "Acme Inc.",
              location: "Montreal, QC",
              description: "Customize this description.",
            },
          },
        ],
      },
      { type: "involvement", title: { fr: "Implications", en: "Involvement" }, items: [] },
      { type: "education", title: { fr: "Éducation", en: "Education" }, items: [] },
      {
        type: "skills",
        title: { fr: "Compétences", en: "Skills" },
        items: [
          {
            fr: { category: "Langages", value: "Python, TypeScript, Go" },
            en: { category: "Languages", value: "Python, TypeScript, Go" },
          },
        ],
      },
      { type: "distinctions", title: { fr: "Distinctions", en: "Distinctions" }, items: [] },
      { type: "hobbies", title: { fr: "Loisirs", en: "Hobbies" }, items: [] },
    ],
  },
  {
    type: "video",
    slug: "video",
    position: 2,
    sections: [
      {
        type: "video_embed",
        title: { fr: "Présentation vidéo", en: "Video introduction" },
        items: [],
      },
    ],
  },
  {
    type: "research",
    slug: "research",
    position: 3,
    sections: [
      {
        type: "publication_list",
        title: { fr: "Publications", en: "Publications" },
        items: [],
      },
    ],
  },
  {
    type: "portfolio",
    slug: "portfolio",
    position: 4,
    sections: [
      {
        type: "portfolio_gallery",
        title: { fr: "Portfolio", en: "Portfolio" },
        items: [],
      },
    ],
  },
  {
    type: "contact",
    slug: "contact",
    position: 5,
    sections: [
      {
        type: "contact_links",
        title: { fr: "Me contacter", en: "Get in touch" },
        items: [
          {
            kind: "email",
            label: { fr: "Courriel professionnel", en: "Work email" },
            value: "prenom@domaine.com",
          },
        ],
      },
    ],
  },
] as const;

// ── Exécution CLI : `npm run db:init` ──
if (import.meta.url === `file://${process.argv[1]}`) {
  void (async () => {
    const Database = (await import("better-sqlite3")).default;
    const path = process.env.DATABASE_PATH ?? "./data/cv.db";
    const { mkdirSync, existsSync } = await import("node:fs");
    const { dirname } = await import("node:path");
    if (!existsSync(dirname(path))) mkdirSync(dirname(path), { recursive: true });
    const conn = new Database(path);
    conn.pragma("journal_mode = WAL");
    conn.pragma("foreign_keys = ON");
    bootstrapDatabase(conn);
    console.log(`✔ Base initialisée : ${path}`);
  })();
}

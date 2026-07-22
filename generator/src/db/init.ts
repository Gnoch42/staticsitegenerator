import type BetterSqlite3 from "better-sqlite3";

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
  preview_url TEXT
);

CREATE TABLE IF NOT EXISTS site (
  id               INTEGER PRIMARY KEY,
  template_id      TEXT NOT NULL REFERENCES templates(id),
  languages        TEXT NOT NULL,
  default_language TEXT NOT NULL,
  owner_name       TEXT,
  published_at     INTEGER
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

CREATE INDEX IF NOT EXISTS idx_sections_page ON sections(page_id);
CREATE INDEX IF NOT EXISTS idx_items_section ON items(section_id);
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

  addColumn("site", "owner_name", "TEXT");
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
}

// ── Seed : templates (toujours à jour) + contenu de départ (si vide) ──
function seed(conn: BetterSqlite3.Database): void {
  const insertTemplate = conn.prepare(
    `INSERT INTO templates (id, name, preview_url)
     VALUES (@id, @name, @previewUrl)
     ON CONFLICT(id) DO UPDATE SET name = excluded.name, preview_url = excluded.preview_url`,
  );
  for (const t of TEMPLATES) insertTemplate.run(t);

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

const TEMPLATES = [
  { id: "minimal", name: "Minimaliste", previewUrl: "/themes/minimal.png" },
  { id: "structured", name: "Structuré", previewUrl: "/themes/structured.png" },
  { id: "academic", name: "Académique", previewUrl: "/themes/academic.png" },
  { id: "modern", name: "Moderne", previewUrl: "/themes/modern.png" },
  { id: "slate", name: "Slate", previewUrl: "/themes/slate.png" },
];

const DEFAULT_PAGES = [
  {
    type: "cv",
    slug: "cv",
    position: 0,
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
    position: 1,
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
    position: 2,
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
    position: 3,
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
    position: 4,
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

# CV site generator

*Version française : [README.fr.md](README.fr.md).*

A **self-hosted, single-user** web app to generate a professional personal site
of up to five pages (**CV, Video, Publications, Portfolio, Contact**), bilingual,
with PDF export of the CV and company/role-targeted **CV profiles**. One instance =
one person (isolation is at the infrastructure level — one Docker instance per
person, no multi-tenant in the code).

## Architecture

Two services, one shared volume:

| Service | Role | Lifecycle |
|---|---|---|
| **cv-generator** | Next.js app: editing (`/admin`), preview, static generation, PDF | Started **on demand** (Start/Stop) |
| **cv-site** | **Caddy** server that serves the published static files | **Always on** |

The shared volume holds:
- `/data/cv.db` — **SQLite** database (written by `cv-generator`)
- `/data/site/` — published static site (written by `cv-generator`, served by `cv-site`)
- `/data/uploads/` — uploaded images (portfolio, profile photo)

The **"Publish"** button renders the enabled pages (in every configured language),
writes the HTML/CSS into `/data/site`, and calls **no external service** — everything
stays local to the instance.

### Stack
Next.js (App Router) · TypeScript · Drizzle ORM + better-sqlite3 · Playwright (PDF) ·
Caddy · single-password auth (signed session cookie).

## Features
- **Toggleable tabs** — each page can be enabled/disabled from Settings; disabled
  pages are removed from the published site.
- **Name & profile photo** — shown at the top of the CV (all templates + PDF), with
  a clean fallback when no photo is set. The photo can be limited to specific
  profiles, like any item.
- **CV profiles** — targeted variants (role/company). Each content item (and the
  photo) can be tagged to zero, one, or several profiles (many-to-many). An item
  with **no profile is always included**. The active profile drives both the
  published web CV and the PDF; "Full CV" shows everything. Profiles are the single
  targeting mechanism (no separate per-item enable/visibility toggles).
- **Automatic chronological order** — dated sections (experience, involvement,
  education, publications) are sorted most-recent-first automatically.
- **Locale-aware dates** — displayed month-year in French, year-month in English.
- **Web vs PDF** — same content, but each render has its own layout (compact print
  layout for the PDF); line breaks in text are preserved.
- **Bilingual content** — per-item JSON, with a no-reload FR/EN toggle on the site.
- **Bilingual admin UI** — the `/admin` interface itself is available in French or
  English, independently of the CV content language.
- **Portfolio** — commented image gallery, by external **URL** or **file upload**.
- **5 templates** — minimal, structured, academic, modern, slate.

## Run locally

### Option A — Node (development)
```bash
cd generator
npm install

# 1) Generate the admin password hash
node scripts/hash-password.mjs "yourPassword"

# 2) Environment variables (in generator/.env.local or the environment)
export ADMIN_PASSWORD_HASH='<hash from step 1>'
export SESSION_SECRET="$(openssl rand -hex 32)"
export DATABASE_PATH=./data/cv.db
export SITE_OUTPUT_DIR=./data/site

# 3) Start
npm run dev
```
- Editor: http://localhost:3000/admin
- Live preview: http://localhost:3000/preview
- After "Publish", the static site is written to `generator/data/site/`.

> **Alternative**: put the variables in `generator/.env.local` (loaded
> automatically). ⚠️ In a `.env` file, **escape every `$` in the bcrypt hash as
> `\$`** (otherwise Next corrupts the hash and login fails) — e.g.
> `ADMIN_PASSWORD_HASH=\$2b\$12\$...`. With a shell `export` in single quotes, no
> escaping is needed.

> PDF export needs the Playwright browser: `npx playwright install chromium` (once).

> **Full local reset**: `lsof -ti :3000 | xargs kill -9`, then in `generator/`
> run `rm -rf .next data` and `npm run dev` (starts from a fresh database).

### Option B — Docker Compose (production-like)
```bash
cp .env.example .env
# edit .env: ADMIN_PASSWORD_HASH, SESSION_SECRET
docker compose up --build
```
To reach the services locally, uncomment the `ports:` blocks in `docker-compose.yml`
(`3000` for the admin, `8080` for the published site).

## Deploy on Coolify

Create **two resources** in the same project, both pointing at this Git repo.

### 1. Shared volume
Create a named volume (e.g. `cv-shared`) mounted at **`/data`** in **both**
resources. It is the only shared point between them.

### 2. `cv-generator` resource
- **Build**: Dockerfile — context `generator/`, `generator/Dockerfile`
- **Exposed port**: `3000` (Traefik routes the domain to this port — no hard-coded port mapping)
- **Volume**: `cv-shared` → `/data`
- **Environment variables**:
  | Variable | Value |
  |---|---|
  | `ADMIN_PASSWORD_HASH` | bcrypt hash (raw, **no `\` escaping** in the Coolify UI) |
  | `SESSION_SECRET` | `openssl rand -hex 32` |
  | `DATABASE_PATH` | `/data/cv.db` |
  | `SITE_OUTPUT_DIR` | `/data/site` |
  | `PORT` | `3000` |
- **Domain**: e.g. `admin.mydomain.com` (TLS handled by Coolify/Traefik)

### 3. `cv-site` resource
- **Build**: Dockerfile — context `site/`, `site/Dockerfile`
- **Exposed port**: `80`
- **Volume**: `cv-shared` → `/data` (read-only ideally)
- **Domain**: e.g. `mydomain.com`

### `cv-generator` Start/Stop cycle
`cv-generator` is designed to be **stopped when you are not editing**:
- On start it creates the schema and seeds data **only if needed** (idempotent
  `CREATE TABLE IF NOT EXISTS`, column migrations, seed) → fast cold start.
- You **start** it in Coolify to edit/publish, then **stop** it.
- `cv-site` stays **always on** and keeps serving the last published version (files
  live in the volume), even when `cv-generator` is stopped.

Nothing is lost on stop: the database and the published site live in the volume.
Schema upgrades (new columns, `profiles`/`item_profiles` tables) are applied
automatically to an existing database — **no reset needed**.

## Data model (SQLite)
`site` (1 row) · `templates` (seed) · `pages` · `sections` · `items` ·
`profiles` · `item_profiles` (many-to-many item ↔ profile). Multilingual content is
stored as **JSON per item** (no table duplication).
Schema: [`generator/src/db/schema.ts`](generator/src/db/schema.ts) ·
seed & migration: [`generator/src/db/init.ts`](generator/src/db/init.ts).

## Templates
Five themes that consume the **same** data model, with no theme-specific business
logic (all the difference is in rendering + CSS): **minimal**, **structured** (two
columns, reference CV wireframe), **academic**, **modern**, **slate**. Each template
renders both a web layout and a compact **print layout** for the PDF.
Components: `generator/src/templates/*` · styles: `generator/public/themes/*.css`.

## Portfolio & uploaded images
Uploaded images are stored in the volume (`<DATA_DIR>/uploads`, overridable via
`UPLOADS_DIR`), served at `/uploads/<file>` while editing, then **copied into the
published site** on publish (Caddy serves them).

## Automatic translation
Isolated extension point: [`generator/src/lib/translate.ts`](generator/src/lib/translate.ts)
(`translateContent()`). It is a **stub**; wiring DeepL / an LLM is done only inside
`callProvider()` without touching the rest of the app.

## Not included
No multi-tenant · no Git integration · no OAuth/SSO · no ORCID/Scholar import ·
no real translation API call (architecture ready).

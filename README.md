# Générateur de site CV

Application web **auto-hébergée, mono-utilisateur** pour générer un site personnel
professionnel de 4 pages (**CV, Vidéo, Publications, Contact**), bilingue, avec
export PDF du CV. Une instance = une personne (l'isolation se fait au niveau
infrastructure, une instance Docker par utilisateur — aucun multi-tenant dans le code).

## Architecture

Deux services, un volume partagé :

| Service | Rôle | Cycle de vie |
|---|---|---|
| **cv-generator** | App Next.js : édition (`/admin`), aperçu, génération statique, PDF | Démarré **à la demande** (Start/Stop) |
| **cv-site** | Serveur **Caddy** qui sert les fichiers statiques publiés | **Toujours actif** |

Le volume partagé contient :
- `/data/cv.db` — base **SQLite** (écrite par `cv-generator`)
- `/data/site/` — site statique publié (écrit par `cv-generator`, servi par `cv-site`)

Le bouton **« Publier »** rend les 4 pages (dans toutes les langues configurées),
écrit le HTML/CSS dans `/data/site`, et n'appelle **aucun service externe** — tout
reste local à l'instance.

### Stack
Next.js (App Router) · TypeScript · Drizzle ORM + better-sqlite3 · Playwright (PDF) ·
Caddy · Auth par mot de passe unique (cookie de session signé).

## Lancer en local

### Option A — Node (développement)
```bash
cd generator
npm install

# 1) Générer le hash du mot de passe admin
node scripts/hash-password.mjs "monMotDePasse"

# 2) Variables d'environnement (dans generator/.env.local ou l'environnement)
export ADMIN_PASSWORD_HASH='<hash obtenu ci-dessus>'
export SESSION_SECRET="$(openssl rand -hex 32)"
export DATABASE_PATH=./data/cv.db
export SITE_OUTPUT_DIR=./data/site

# 3) Initialiser la base (facultatif : fait aussi au 1er démarrage)
npm run db:init

# 4) Démarrer
npm run dev
```
- Éditeur : http://localhost:3000/admin
- Aperçu live : http://localhost:3000/preview
- Après « Publier », le site statique est écrit dans `generator/data/site/`.

> L'export **PDF** nécessite les navigateurs Playwright :
> `npx playwright install chromium` (une seule fois).

### Option B — Docker Compose (proche de la prod)
```bash
cp .env.example .env
# éditez .env : ADMIN_PASSWORD_HASH, SESSION_SECRET
docker compose up --build
```
Pour accéder aux services en local, décommentez les blocs `ports:` dans
`docker-compose.yml` (`3000` pour l'admin, `8080` pour le site publié).

## Déploiement sur Coolify

Créez **deux ressources** dans le même projet, pointant sur ce dépôt Git.

### 1. Volume partagé
Créez un volume nommé (ex. `cv-shared`) monté sur **`/data`** dans les **deux**
ressources. C'est le seul point de partage entre elles.

### 2. Ressource `cv-generator`
- **Build** : Dockerfile — contexte `generator/`, `generator/Dockerfile`
- **Port exposé** : `3000` (Traefik route le domaine vers ce port — pas de mapping de port en dur)
- **Volume** : `cv-shared` → `/data`
- **Variables d'environnement** :
  | Variable | Valeur |
  |---|---|
  | `ADMIN_PASSWORD_HASH` | hash bcrypt (voir `hash-password.mjs`) |
  | `SESSION_SECRET` | `openssl rand -hex 32` |
  | `DATABASE_PATH` | `/data/cv.db` |
  | `SITE_OUTPUT_DIR` | `/data/site` |
  | `PORT` | `3000` |
- **Domaine** : ex. `admin.mondomaine.com` (TLS géré par Coolify/Traefik)

### 3. Ressource `cv-site`
- **Build** : Dockerfile — contexte `site/`, `site/Dockerfile`
- **Port exposé** : `80`
- **Volume** : `cv-shared` → `/data` (lecture seule idéalement)
- **Domaine** : ex. `mondomaine.com`

### Cycle Start/Stop de `cv-generator`
`cv-generator` est conçu pour être **arrêté quand vous n'éditez pas** :
- Au démarrage, il crée le schéma et sème les données **seulement si nécessaire**
  (`CREATE TABLE IF NOT EXISTS`, seed idempotent) → démarrage à froid rapide.
- Vous le **démarrez** dans Coolify pour éditer/publier, puis vous le **coupez**.
- `cv-site` reste **toujours actif** et continue de servir la dernière version
  publiée (les fichiers restent dans le volume), même quand `cv-generator` est arrêté.

Rien n'est perdu à l'arrêt : la base et le site publié vivent dans le volume.

## Modèle de données (SQLite)

`site` (1 ligne) · `templates` (seed) · `pages` · `sections` · `items`.
Contenu multilingue stocké en **JSON par item** (pas de duplication de table).
Schéma : [`generator/src/db/schema.ts`](generator/src/db/schema.ts) ·
seed & bootstrap : [`generator/src/db/init.ts`](generator/src/db/init.ts).

## Templates
Trois thèmes qui consomment le **même** modèle de données, sans logique métier
propre (toute la différence est dans le rendu + CSS) :
- **minimal** — sobre, typographique
- **structured** — deux colonnes (implémente le wireframe de référence du CV)
- **academic** — sérif, met en valeur les publications

Composants : `generator/src/templates/*` · styles : `generator/public/themes/*.css`.

## Traduction automatique
Point d'extension isolé : [`generator/src/lib/translate.ts`](generator/src/lib/translate.ts)
(`translateContent()`). En v1 c'est un **stub** ; brancher DeepL / un LLM se fait
uniquement dans `callProvider()` sans toucher au reste de l'app.

## Ce qui n'est PAS inclus (v1)
Pas de multi-tenant · pas d'intégration Git · pas d'OAuth/SSO · pas d'import
ORCID/Scholar · pas de vrai appel d'API de traduction (architecture prête).

# Générateur de site CV

*English version: [README.md](README.md).*

Application web **auto-hébergée, mono-utilisateur** pour générer un site personnel
professionnel de cinq pages (**CV, Vidéo, Publications, Portfolio, Contact**),
bilingue, avec export PDF du CV et **profils de CV** ciblés par entreprise/poste.
Une instance = une personne (l'isolation se fait au niveau infrastructure, une
instance Docker par personne — aucun multi-tenant dans le code).

## Architecture

Deux services, un volume partagé :

| Service | Rôle | Cycle de vie |
|---|---|---|
| **cv-generator** | App Next.js : édition (`/admin`), aperçu, génération statique, PDF | Démarré **à la demande** (Start/Stop) |
| **cv-site** | Serveur **Caddy** qui sert les fichiers statiques publiés | **Toujours actif** |

Le volume partagé contient :
- `/data/cv.db` — base **SQLite** (écrite par `cv-generator`)
- `/data/site/` — site statique publié (écrit par `cv-generator`, servi par `cv-site`)
- `/data/uploads/` — images téléversées (portfolio, photo de profil)

Le bouton **« Publier »** rend les pages activées (dans toutes les langues
configurées), écrit le HTML/CSS dans `/data/site`, et n'appelle **aucun service
externe** — tout reste local à l'instance.

### Stack
Next.js (App Router) · TypeScript · Drizzle ORM + better-sqlite3 · Playwright (PDF) ·
Caddy · auth par mot de passe unique (cookie de session signé).

## Fonctionnalités
- **Onglets activables** — chaque page s'active/désactive depuis Réglages ; les
  pages désactivées sont retirées du site publié.
- **Nom et photo de profil** — affichés en en-tête du site et en haut du CV (tous
  templates + PDF), avec repli propre si aucune photo.
- **Profils de CV** — variantes ciblées (poste/entreprise). Chaque item peut être
  associé à 0, 1 ou plusieurs profils (plusieurs-à-plusieurs). Un item **sans profil
  est toujours inclus**. Le profil actif pilote le CV web publié ET le PDF ; « CV
  complet » montre tout.
- **Visibilité en ligne / imprimé** — chaque section et item peut être « En ligne +
  PDF », « En ligne seulement » ou « PDF seulement ». Les deux rendus filtrent en
  conséquence et peuvent donc différer (PDF compact, contenu web-only).
- **Contenu bilingue** — JSON par item, avec bascule FR/EN sans rechargement.
- **Interface admin bilingue** — l'interface `/admin` est disponible en français ou
  en anglais, indépendamment de la langue du contenu.
- **Portfolio** — galerie d'images commentées, par **URL** externe ou **upload**.
- **5 templates** — minimal, structured, academic, modern, slate.

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

# 3) Démarrer
npm run dev
```
- Éditeur : http://localhost:3000/admin
- Aperçu live : http://localhost:3000/preview
- Après « Publier », le site statique est écrit dans `generator/data/site/`.

> **Alternative** : mettre les variables dans `generator/.env.local` (chargé
> automatiquement). ⚠️ Dans un fichier `.env`, **échappez chaque `$` du hash bcrypt
> en `\$`** (sinon Next corrompt le hash et la connexion échoue) — ex.
> `ADMIN_PASSWORD_HASH=\$2b\$12\$...`. Avec un `export` shell entre quotes simples,
> pas d'échappement nécessaire.

> L'export PDF nécessite le navigateur Playwright : `npx playwright install chromium` (une fois).

> **Reset local complet** : `lsof -ti :3000 | xargs kill -9`, puis dans `generator/`
> `rm -rf .next data` et `npm run dev` (repart d'une base neuve).

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
- **Port exposé** : `3000` (Traefik route le domaine vers ce port — pas de mapping en dur)
- **Volume** : `cv-shared` → `/data`
- **Variables d'environnement** :
  | Variable | Valeur |
  |---|---|
  | `ADMIN_PASSWORD_HASH` | hash bcrypt (brut, **sans échappement `\`** dans l'UI Coolify) |
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
  (`CREATE TABLE IF NOT EXISTS` idempotent, migrations de colonnes, seed) → démarrage
  à froid rapide.
- Vous le **démarrez** dans Coolify pour éditer/publier, puis vous le **coupez**.
- `cv-site` reste **toujours actif** et continue de servir la dernière version
  publiée, même quand `cv-generator` est arrêté.

Rien n'est perdu à l'arrêt : la base et le site publié vivent dans le volume. Les
évolutions de schéma (nouvelles colonnes, tables `profiles`/`item_profiles`) sont
appliquées automatiquement à une base existante — **aucun reset nécessaire**.

## Modèle de données (SQLite)
`site` (1 ligne) · `templates` (seed) · `pages` · `sections` · `items` ·
`profiles` · `item_profiles` (plusieurs-à-plusieurs item ↔ profil). Contenu
multilingue en **JSON par item** (pas de duplication de table).
Schéma : [`generator/src/db/schema.ts`](generator/src/db/schema.ts) ·
seed & migration : [`generator/src/db/init.ts`](generator/src/db/init.ts).

## Templates
Cinq thèmes qui consomment le **même** modèle de données, sans logique métier propre
(toute la différence est dans le rendu + CSS) : **minimal**, **structured** (deux
colonnes, wireframe de référence), **academic**, **modern**, **slate**. Chaque
template rend un layout web ET un layout **imprimé** compact pour le PDF.
Composants : `generator/src/templates/*` · styles : `generator/public/themes/*.css`.

## Portfolio & images téléversées
Les images téléversées sont stockées dans le volume (`<DATA_DIR>/uploads`,
surchargeable via `UPLOADS_DIR`), servies à `/uploads/<fichier>` pendant l'édition,
puis **copiées dans le site publié** à la publication (Caddy les sert).

## Traduction automatique
Point d'extension isolé : [`generator/src/lib/translate.ts`](generator/src/lib/translate.ts)
(`translateContent()`). En v1 c'est un **stub** ; brancher DeepL / un LLM se fait
uniquement dans `callProvider()` sans toucher au reste de l'app.

## Ce qui n'est PAS inclus
Pas de multi-tenant · pas d'intégration Git · pas d'OAuth/SSO · pas d'import
ORCID/Scholar · pas de vrai appel d'API de traduction (architecture prête).

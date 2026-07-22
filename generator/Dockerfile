# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────
#  cv-generator — app Next.js (édition + génération + PDF).
#  Image autonome, buildable indépendamment.
# ─────────────────────────────────────────────────────────────

# ── 1. Dépendances (build tools pour better-sqlite3) ──
FROM node:20-bookworm AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package.json ./
RUN npm install

# ── 2. Build Next.js (sortie standalone) ──
FROM node:20-bookworm AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ── 3. Runtime (Node 20 + Chromium pour Playwright) ──
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Sortie standalone (inclut les node_modules tracés : better-sqlite3, playwright…)
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

# Chromium + libs système (version alignée sur le paquet playwright).
RUN npm i -g playwright@1.49.0 \
    && playwright install --with-deps chromium \
    && npm cache clean --force

EXPOSE 3000
CMD ["node", "server.js"]

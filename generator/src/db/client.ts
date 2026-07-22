import "server-only";
import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import * as schema from "./schema";
import { bootstrapDatabase } from "./init";

type DB = BetterSQLite3Database<typeof schema>;

const DB_PATH = process.env.DATABASE_PATH ?? "./data/cv.db";

const globalForDb = globalThis as unknown as { __db?: DB };

/**
 * Ouverture PARESSEUSE : la connexion et le bootstrap ne se font qu'au
 * premier accès réel (donc à l'exécution d'une requête), jamais au simple
 * import du module. Cela évite d'ouvrir la base pendant `next build`
 * (workers parallèles → verrous SQLITE_BUSY) et accélère le démarrage.
 */
function initDb(): DB {
  const dir = dirname(DB_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const conn = new Database(DB_PATH);
  conn.pragma("journal_mode = WAL");
  conn.pragma("busy_timeout = 5000");
  conn.pragma("foreign_keys = ON");

  bootstrapDatabase(conn); // idempotent
  return drizzle(conn, { schema });
}

export function getDb(): DB {
  return (globalForDb.__db ??= initDb());
}

// Proxy : préserve l'ergonomie `db.select()...` tout en restant paresseux.
export const db = new Proxy({} as DB, {
  get(_target, prop) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === "function" ? value.bind(real) : value;
  },
}) as DB;

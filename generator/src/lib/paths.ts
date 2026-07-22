import "server-only";
import { dirname, join } from "node:path";

/**
 * Répertoire des images uploadées (portfolio), dans le volume partagé.
 * Dérivé de DATABASE_PATH par défaut (donc à côté de la base, dans /data),
 * surchargeable via UPLOADS_DIR.
 */
export function uploadsDir(): string {
  if (process.env.UPLOADS_DIR) return process.env.UPLOADS_DIR;
  const dbPath = process.env.DATABASE_PATH ?? "./data/cv.db";
  return join(dirname(dbPath), "uploads");
}

/** Nettoie un nom de fichier pour empêcher tout parcours de répertoire. */
export function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/^\.+/, "");
}

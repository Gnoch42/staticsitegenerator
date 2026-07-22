import "server-only";
import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "cv_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 jours

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET manquant");
  return s;
}

/** Compare le mot de passe soumis au hash bcrypt en variable d'env. */
export function verifyPassword(password: string): boolean {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) throw new Error("ADMIN_PASSWORD_HASH manquant");
  try {
    return bcrypt.compareSync(password, hash);
  } catch {
    return false;
  }
}

// ── Token de session signé (HMAC) : `<payload>.<signature>` ──

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function createToken(): string {
  const payload = JSON.stringify({
    iat: Date.now(),
    nonce: randomBytes(8).toString("hex"),
  });
  const encoded = Buffer.from(payload).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

function isTokenValid(token: string | undefined): boolean {
  if (!token) return false;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return false;

  const expected = sign(encoded);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  try {
    const { iat } = JSON.parse(Buffer.from(encoded, "base64url").toString());
    return Date.now() - iat < MAX_AGE_SECONDS * 1000;
  } catch {
    return false;
  }
}

// ── Gestion du cookie ──

export async function createSession(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, createToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return isTokenValid(store.get(COOKIE_NAME)?.value);
}

/** À appeler en tête des pages/actions admin : redirige si non connecté. */
export async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) redirect("/admin/login");
}

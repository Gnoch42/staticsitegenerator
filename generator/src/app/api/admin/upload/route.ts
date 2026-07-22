import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import { join, extname } from "node:path";
import { randomBytes } from "node:crypto";
import { isAuthenticated } from "@/lib/auth";
import { uploadsDir, safeFileName } from "@/lib/paths";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"]);
const MAX_BYTES = 8 * 1024 * 1024; // 8 Mo

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Fichier trop lourd (max 8 Mo)" }, { status: 413 });
  }

  const ext = extname(file.name).toLowerCase();
  if (!ALLOWED.has(ext)) {
    return NextResponse.json(
      { error: "Format non supporté (jpg, png, webp, gif, avif, svg)" },
      { status: 415 },
    );
  }

  const dir = uploadsDir();
  await fs.mkdir(dir, { recursive: true });
  const base = safeFileName(file.name.slice(0, file.name.length - ext.length)).slice(0, 40) || "img";
  const name = `${base}-${randomBytes(4).toString("hex")}${ext}`;

  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(join(dir, name), buf);

  return NextResponse.json({ url: `/uploads/${name}` });
}

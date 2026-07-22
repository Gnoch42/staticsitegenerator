import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import { join, extname } from "node:path";
import { uploadsDir, safeFileName } from "@/lib/paths";

export const runtime = "nodejs";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
};

// Sert les images uploadées (portfolio) depuis le volume, pendant l'édition.
// Sur le site publié, ces mêmes fichiers sont copiés dans /data/site/uploads
// et servis directement par Caddy.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  const name = safeFileName(file);
  const path = join(uploadsDir(), name);
  try {
    const data = await fs.readFile(path);
    const type = MIME[extname(name).toLowerCase()] ?? "application/octet-stream";
    return new NextResponse(new Uint8Array(data) as unknown as BodyInit, {
      status: 200,
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=3600" },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}

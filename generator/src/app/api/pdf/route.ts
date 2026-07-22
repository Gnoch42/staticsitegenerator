import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { renderCvPdf } from "@/lib/pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await isAuthenticated())) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const lang = new URL(req.url).searchParams.get("lang") ?? undefined;
  try {
    const pdf = await renderCvPdf(lang);
    // Cast : Uint8Array est un BodyInit valide, mais le générique
    // Uint8Array<ArrayBufferLike> de TS 5.7 n'unifie pas avec ArrayBuffer.
    return new NextResponse(pdf as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="cv.pdf"',
      },
    });
  } catch (err) {
    console.error("PDF error", err);
    return new NextResponse("Erreur lors de la génération du PDF", {
      status: 500,
    });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getDemoMode } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as h5pService from "@/lib/services/h5p";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  try {
    const { contentId } = await params;
    if (!contentId) return NextResponse.json({ error: "contentId requerido" }, { status: 400 });
    if (getDemoMode()) {
      return NextResponse.json({
        id: "demo-h5p",
        title: "Flashcards demo",
        contentType: "flashcards",
        content: {
          type: "flashcards",
          cards: [
            { front: "Pregunta 1", back: "Respuesta 1" },
            { front: "Pregunta 2", back: "Respuesta 2" },
          ],
        },
      });
    }
    await getAuthFromRequest(_req);
    const doc = await h5pService.getH5PContent(contentId);
    if (!doc) return NextResponse.json({ error: "Contenido no encontrado" }, { status: 404 });
    return NextResponse.json(doc);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "No autorizado" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

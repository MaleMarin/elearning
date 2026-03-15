import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as h5pService from "@/lib/services/h5p";
import type { H5PContentPayload } from "@/lib/services/h5p";

export const dynamic = "force-dynamic";

/** GET: listar contenido H5P del usuario (admin/mentor). */
export async function GET(req: NextRequest) {
  if (getDemoMode()) {
    return NextResponse.json([
      { id: "demo-h5p", title: "Flashcards demo", contentType: "flashcards", updatedAt: new Date().toISOString() },
    ]);
  }
  if (!useFirebase()) return NextResponse.json([], { status: 200 });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin" && auth.role !== "mentor") return NextResponse.json({ error: "Solo admin o mentor" }, { status: 403 });
    const list = await h5pService.listH5PContentByUser(auth.uid);
    return NextResponse.json(list.map((d) => ({ id: d.id, title: d.title, contentType: d.contentType, updatedAt: d.updatedAt })));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : 500 });
  }
}

/** POST: crear contenido H5P (admin/mentor). Body: { title, content: H5PContentPayload }. */
export async function POST(req: NextRequest) {
  if (getDemoMode()) {
    return NextResponse.json({ id: "demo-h5p-new", title: "Nuevo contenido", contentType: "quiz" });
  }
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin" && auth.role !== "mentor") return NextResponse.json({ error: "Solo admin o mentor" }, { status: 403 });
    const body = await req.json().catch(() => ({}));
    const title = typeof body.title === "string" ? body.title.trim() : "Sin título";
    const content = body.content as H5PContentPayload | undefined;
    if (!content || !content.type) return NextResponse.json({ error: "content con type requerido" }, { status: 400 });
    const validTypes = ["interactive_video", "flashcards", "quiz", "image_hotspot"];
    if (!validTypes.includes(content.type)) return NextResponse.json({ error: "content.type no válido" }, { status: 400 });
    const doc = await h5pService.createH5PContent(auth.uid, title, content);
    return NextResponse.json({ id: doc.id, title: doc.title, contentType: doc.contentType });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : 500 });
  }
}

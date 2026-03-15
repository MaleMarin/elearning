/**
 * POST: importar PowerPoint (.pptx).
 * 1. Convertir con librería a HTML (cada slide = bloque)
 * 2. Crear lección con bloques tipo "slide"
 * 3. Opcional: generar quiz con Claude desde el contenido
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as firebaseContent from "@/lib/services/firebase-content";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ error: "Demo: importación no disponible" }, { status: 400 });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const moduleId = (formData.get("moduleId") as string)?.trim();
    const title = ((formData.get("title") as string) ?? "").trim() || "Presentación importada";
    if (!file || !moduleId) return NextResponse.json({ error: "Falta file o moduleId" }, { status: 400 });
    const canEdit = await firebaseContent.canEditModule(moduleId, auth.uid, auth.role);
    if (!canEdit) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    const buf = Buffer.from(await file.arrayBuffer());
    let slidesHtml: string[] = [];
    try {
      const pptx2html = await import("pptx2html").catch(() => null);
      if (pptx2html?.default) {
        const result = await pptx2html.default(buf);
        slidesHtml = Array.isArray(result) ? result : result?.slides ?? (result?.html ? [result.html] : []);
      }
    } catch {
      // Fallback: crear una lección con contenido placeholder si pptx2html no está o falla
      slidesHtml = [`<p>Contenido de "${file.name}". Instala <code>pptx2html</code> para conversión automática.</p>`];
    }

    const blocks = slidesHtml.map((html, i) => ({
      id: `slide-${i}`,
      type: "slide" as const,
      content: { html },
    }));
    const existingLessons = await firebaseContent.getLessons(moduleId);
    const lessonRef = await firebaseContent.createLesson(moduleId, {
      title: title.slice(0, 200),
      summary: `${slidesHtml.length} diapositiva(s) importada(s)`,
      content: "",
      order_index: existingLessons.length,
      status: "draft",
    });
    const lessonId = (lessonRef as { id: string }).id;
    await firebaseContent.updateLesson(lessonId, { blocks });
    return NextResponse.json({ lessonId, title, slidesCount: slidesHtml.length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al importar";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

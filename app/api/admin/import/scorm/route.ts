/**
 * POST: importar paquete SCORM (.zip).
 * 1. Descomprimir en memoria
 * 2. Parsear imsmanifest.xml para extraer estructura
 * 3. Subir a Firebase Storage en scorm/{moduleId}/{lessonId}/
 * 4. Crear lección en Firestore con type: "scorm" y scormStoragePath
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getFirebaseAdminStorage } from "@/lib/firebase/admin";
import * as firebaseContent from "@/lib/services/firebase-content";
import JSZip from "jszip";

export const dynamic = "force-dynamic";

function parseManifest(xmlStr: string): { title: string; resourceHref: string } {
  const titleMatch = xmlStr.match(/<title>([^<]*)<\/title>/i) || xmlStr.match(/<dc:title>([^<]*)<\/dc:title>/i);
  const resourceMatch = xmlStr.match(/<resource[^>]*href="([^"]+)"/i) || xmlStr.match(/href="([^"]+\.htm[l]?)"/i);
  return {
    title: (titleMatch?.[1] ?? "Contenido SCORM").trim(),
    resourceHref: (resourceMatch?.[1] ?? "index.html").trim(),
  };
}

export async function POST(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ error: "Demo: importación no disponible" }, { status: 400 });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const moduleId = (formData.get("moduleId") as string)?.trim();
    if (!file || !moduleId) return NextResponse.json({ error: "Falta file o moduleId" }, { status: 400 });
    const canEdit = await firebaseContent.canEditModule(moduleId, auth.uid, auth.role);
    if (!canEdit) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    const buf = Buffer.from(await file.arrayBuffer());
    const zip = await JSZip.loadAsync(buf);
    const manifestEntry = zip.file("imsmanifest.xml") ?? zip.file("imsmanifest.xml") ?? Object.values(zip.files).find((f) => f.name.toLowerCase().endsWith("imsmanifest.xml"));
    if (!manifestEntry) return NextResponse.json({ error: "No se encontró imsmanifest.xml en el paquete" }, { status: 400 });
    const xmlStr = await manifestEntry.async("string");
    const { title, resourceHref } = parseManifest(xmlStr);

    const storage = getFirebaseAdminStorage();
    const bucket = storage.bucket();
    const prefix = `scorm/${moduleId}/${Date.now()}`;
    for (const [path, entry] of Object.entries(zip.files)) {
      if (entry.dir) continue;
      const blob = await entry.async("nodebuffer");
      const filePath = `${prefix}/${path}`;
      const f = bucket.file(filePath);
      await f.save(blob, { contentType: path.endsWith(".xml") ? "application/xml" : undefined });
    }

    const existingLessons = await firebaseContent.getLessons(moduleId);
    const orderIndex = existingLessons.length;
    const lessonRef = await firebaseContent.createLesson(moduleId, {
      title: title.slice(0, 200),
      summary: "Contenido importado desde SCORM",
      content: "",
      order_index: orderIndex,
      status: "draft",
    });
    const lessonId = (lessonRef as { id: string }).id;
    await bucket.file(`${prefix}/.scorm-meta`).save(JSON.stringify({ resourceHref, lessonId }), { contentType: "application/json" });

    return NextResponse.json({
      lessonId,
      title,
      scormStoragePath: prefix,
      resourceHref,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al importar";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

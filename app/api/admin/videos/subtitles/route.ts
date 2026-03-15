/**
 * POST: generar subtítulos con OpenAI Whisper para un video.
 * Body: { videoStorageUrl, lessonId }.
 * Descarga el audio, transcribe con Whisper, guarda .srt en Storage, actualiza lección con subtitulosUrl.
 * Costo: ~$0.006/min de audio.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getFirebaseAdminStorage } from "@/lib/firebase/admin";
import * as firebaseContent from "@/lib/services/firebase-content";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ error: "Demo: no disponible" }, { status: 400 });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY no configurado" }, { status: 503 });
  try {
    const auth = await getAuthFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const videoStorageUrl = (body.videoStorageUrl as string)?.trim();
    const lessonId = (body.lessonId as string)?.trim();
    if (!lessonId) return NextResponse.json({ error: "Falta lessonId" }, { status: 400 });
    const canEdit = await firebaseContent.canEditLesson(lessonId, auth.uid, auth.role);
    if (!canEdit) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    const audioUrl = videoStorageUrl || (await firebaseContent.getLesson(lessonId).then((l) => (l as { video_embed_url?: string })?.video_embed_url));
    if (!audioUrl) return NextResponse.json({ error: "No hay URL de video para la lección" }, { status: 400 });

    const res = await fetch(audioUrl);
    const blob = await res.blob();
    const file = new File([blob], "audio.mp4", { type: blob.type || "audio/mp4" });
    const openai = new OpenAI({ apiKey });
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      language: "es",
      response_format: "srt",
    });
    const srtContent = typeof transcription === "string" ? transcription : (transcription as { text?: string }).text ?? "";

    const storage = getFirebaseAdminStorage();
    const path = `subtitles/${lessonId}/subtitles.srt`;
    const f = storage.bucket().file(path);
    await f.save(srtContent, { contentType: "text/plain; charset=utf-8" });
    const [srtUrl] = await f.getSignedUrl({ action: "read", expires: "03-01-2500" });

    await firebaseContent.updateLesson(lessonId, {
      subtitulosUrl: srtUrl,
      subtitulosGenerados: true,
    });

    return NextResponse.json({ srtUrl });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

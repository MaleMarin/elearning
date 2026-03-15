/**
 * POST /api/video/subtitles
 * Body: { videoUrl: string }. Descarga el recurso (audio/video), transcribe con OpenAI Whisper, retorna SRT.
 * Requiere OPENAI_API_KEY. Formatos soportados por Whisper: mp3, mp4, mpeg, mpga, m4a, wav, webm.
 */
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function POST(req: NextRequest) {
  if (!openai) {
    return NextResponse.json(
      { error: "Transcripción no configurada (OPENAI_API_KEY)" },
      { status: 503 }
    );
  }

  let body: { videoUrl?: string };
  try {
    body = (await req.json()) as { videoUrl?: string };
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const videoUrl = body.videoUrl?.trim();
  if (!videoUrl) {
    return NextResponse.json({ error: "videoUrl requerido" }, { status: 400 });
  }

  try {
    const response = await fetch(videoUrl, { method: "GET" });
    if (!response.ok) {
      return NextResponse.json(
        { error: `No se pudo descargar el recurso: ${response.status}` },
        { status: 400 }
      );
    }

    const contentType = response.headers.get("content-type") ?? "";
    const isAudioOrVideo =
      /audio\/|video\//.test(contentType) ||
      /\.(mp3|mp4|mpeg|mpga|m4a|wav|webm)(\?|$)/i.test(videoUrl);
    if (!isAudioOrVideo) {
      return NextResponse.json(
        { error: "URL debe apuntar a un archivo de audio o video (mp3, mp4, wav, webm, etc.)" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const filename = videoUrl.split("/").pop()?.split("?")[0] || "audio.mp4";
    const file = new File([buffer], filename, { type: response.headers.get("content-type") || "audio/mpeg" });

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      response_format: "srt",
      language: "es",
    });

    const srt = typeof transcription === "string" ? transcription : "";
    return NextResponse.json({ srt, success: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error en la transcripción";
    console.error("[video/subtitles]", e);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

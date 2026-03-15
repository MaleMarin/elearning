/**
 * POST /api/voice/stt — Speech-to-Text con OpenAI Whisper (Brecha 3).
 * Body: multipart/form-data con campo "audio" (archivo de audio).
 * Devuelve { text: string }.
 */
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode } from "@/lib/env";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    if (!getDemoMode()) {
      await getAuthFromRequest(request);
    }
    const key = process.env.OPENAI_API_KEY?.trim();
    if (!key) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY no configurada" },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get("audio");
    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json(
        { error: "Falta el archivo de audio (campo 'audio')" },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey: key });
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile as unknown as File,
      model: "whisper-1",
      language: "es",
      prompt:
        "Transcripción de respuesta de servidor público mexicano sobre política pública e innovación gubernamental.",
    });

    return NextResponse.json({
      text: transcription.text?.trim() ?? "",
    });
  } catch (e) {
    console.error("STT error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error en transcripción" },
      { status: 500 }
    );
  }
}

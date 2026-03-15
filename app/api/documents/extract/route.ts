/**
 * POST /api/documents/extract — Extrae texto de PDF, PPTX, TXT o transcribe audio.
 * Body: multipart/form-data con campo "file".
 * Devuelve { text: string, filename: string }.
 * Para el asistente: sube un documento o audio y obtén texto para resúmenes o preguntas (estilo NotebookLM).
 */
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { extractText } from "@/lib/services/documentParser";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getDemoMode } from "@/lib/env";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_TEXT_LENGTH = 120_000; // ~30k tokens aprox

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user && !getDemoMode()) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "Falta el archivo (campo 'file')" },
        { status: 400 }
      );
    }

    const filename = (file as File).name ?? "documento";
    const mimeType = (file as File).type ?? "";
    const buffer = Buffer.from(await (file as Blob).arrayBuffer());

    // Audio: transcribir con Whisper
    if (
      mimeType.startsWith("audio/") ||
      /\.(webm|mp3|m4a|wav|ogg|flac)$/i.test(filename)
    ) {
      const key = process.env.OPENAI_API_KEY?.trim();
      if (!key) {
        return NextResponse.json(
          { error: "OPENAI_API_KEY no configurada para transcribir audio" },
          { status: 503 }
        );
      }
      const openai = new OpenAI({ apiKey: key });
      const transcription = await openai.audio.transcriptions.create({
        file: new File([buffer], filename, { type: mimeType || "audio/webm" }),
        model: "whisper-1",
        language: "es",
      });
      const text = (transcription.text?.trim() ?? "").slice(0, MAX_TEXT_LENGTH);
      return NextResponse.json({ text, filename });
    }

    // TXT: leer como UTF-8
    if (mimeType === "text/plain" || /\.txt$/i.test(filename)) {
      const text = buffer.toString("utf-8").trim().slice(0, MAX_TEXT_LENGTH);
      return NextResponse.json({ text, filename });
    }

    // PDF / PPTX
    if (
      mimeType === "application/pdf" ||
      mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
      /\.(pdf|pptx)$/i.test(filename)
    ) {
      const text = (await extractText(buffer, mimeType, filename)).slice(
        0,
        MAX_TEXT_LENGTH
      );
      return NextResponse.json({ text, filename });
    }

    return NextResponse.json(
      {
        error:
          "Formato no soportado. Usa PDF, PPTX, TXT o audio (webm, mp3, m4a, wav).",
      },
      { status: 400 }
    );
  } catch (e) {
    console.error("documents/extract error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al procesar el archivo" },
      { status: 500 }
    );
  }
}

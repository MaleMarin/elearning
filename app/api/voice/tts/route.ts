/**
 * POST /api/voice/tts — Text-to-Speech con OpenAI (Brecha 3).
 * Body: { text: string, voice?: string }
 * Devuelve audio/mpeg.
 */
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode } from "@/lib/env";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

function cleanTextForTts(text: string): string {
  return (
    text
      .replace(/#{1,6}\s/g, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/`/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
      .substring(0, 4096)
  );
}

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
    const body = await request.json().catch(() => ({}));
    const rawText = typeof body?.text === "string" ? body.text : "";
    const cleanText = cleanTextForTts(rawText);
    if (!cleanText) {
      return NextResponse.json(
        { error: "Texto vacío o inválido" },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey: key });
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: cleanText,
      speed: 0.95,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    return new Response(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (e) {
    console.error("TTS error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error en TTS" },
      { status: 500 }
    );
  }
}

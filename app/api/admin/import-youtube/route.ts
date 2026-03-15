/**
 * POST: importar microlección desde URL de YouTube.
 * Body: { url: string }. Obtiene transcripción, envía a Claude, devuelve preview.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode } from "@/lib/env";
import { checkAdminAIRateLimit } from "@/lib/rate-limit";
import { generateText } from "ai";
import { getModelWithFallback } from "@/lib/ai/providers";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function extractVideoId(url: string): string | null {
  const u = url.trim();
  const m = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

async function fetchTranscript(videoId: string): Promise<string> {
  const { YoutubeTranscript } = await import("youtube-transcript");
  const items = await YoutubeTranscript.fetchTranscript(videoId);
  return items.map((t) => t.text).join(" ");
}

const YOUTUBE_PROMPT = `Resume este contenido de un video en una microlección de máximo 5 min de lectura.

Genera:
- title: título corto de la microlección
- keyConcepts: array de exactamente 3 conceptos clave (cada uno: { concept: string, timestamp: string } con formato "MM:SS" aproximado donde aparece en el video; si no sabes, usa "00:00")
- summaryParagraphs: array de exactamente 3 párrafos de resumen (strings)
- reflectionQuestions: array de exactamente 2 preguntas de reflexión (strings)

Responde ÚNICAMENTE con un JSON válido, sin markdown ni texto adicional:
{"title":"...","keyConcepts":[{"concept":"...","timestamp":"MM:SS"}],"summaryParagraphs":["...","...","..."],"reflectionQuestions":["...","..."]}

Transcripción del video:

`;

export interface YouTubeMicroLesson {
  title: string;
  keyConcepts: { concept: string; timestamp: string }[];
  summaryParagraphs: string[];
  reflectionQuestions: string[];
  videoId: string;
  embedUrl: string;
}

function parseJson(text: string): Omit<YouTubeMicroLesson, "videoId" | "embedUrl"> {
  const cleaned = text.replace(/^[\s\S]*?(\{[\s\S]*\})[\s\S]*$/, "$1").trim();
  const parsed = JSON.parse(cleaned);
  return {
    title: typeof parsed.title === "string" ? parsed.title : "Microlección",
    keyConcepts: Array.isArray(parsed.keyConcepts) ? parsed.keyConcepts.slice(0, 5).map((c: { concept?: string; timestamp?: string }) => ({ concept: String(c?.concept ?? ""), timestamp: String(c?.timestamp ?? "00:00") })) : [],
    summaryParagraphs: Array.isArray(parsed.summaryParagraphs) ? parsed.summaryParagraphs.slice(0, 5).map((p: unknown) => String(p)) : [],
    reflectionQuestions: Array.isArray(parsed.reflectionQuestions) ? parsed.reflectionQuestions.slice(0, 5).map((q: unknown) => String(q)) : [],
  };
}

const DEMO_YOUTUBE: YouTubeMicroLesson = {
  title: "Introducción desde video",
  keyConcepts: [{ concept: "Concepto 1", timestamp: "00:00" }, { concept: "Concepto 2", timestamp: "02:30" }, { concept: "Concepto 3", timestamp: "05:00" }],
  summaryParagraphs: ["Párrafo 1 de resumen.", "Párrafo 2.", "Párrafo 3."],
  reflectionQuestions: ["¿Cómo aplicarías esto?", "¿Qué dudas te quedan?"],
  videoId: "dQw4w9WgXcQ",
  embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
};

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });

    const { ok, remaining } = checkAdminAIRateLimit(auth.uid);
    if (!ok) return NextResponse.json({ error: "Límite de generaciones diarias alcanzado (10/día)." }, { status: 429 });

    const body = await req.json().catch(() => ({}));
    const url = (body.url as string)?.trim();
    if (!url) return NextResponse.json({ error: "Falta url de YouTube" }, { status: 400 });

    const videoId = extractVideoId(url);
    if (!videoId) return NextResponse.json({ error: "URL de YouTube no válida" }, { status: 400 });

    const embedUrl = `https://www.youtube.com/embed/${videoId}`;

    if (getDemoMode()) {
      return NextResponse.json({
        lesson: { ...DEMO_YOUTUBE, videoId, embedUrl },
        remaining,
      });
    }

    let transcript: string;
    try {
      transcript = await fetchTranscript(videoId);
    } catch {
      return NextResponse.json({ error: "No se pudo obtener la transcripción (video sin subtítulos o no disponible)." }, { status: 400 });
    }
    if (transcript.length > 100000) transcript = transcript.slice(0, 100000) + "\n[...]";

    const model = (await getModelWithFallback("anthropic")).model;
    const { text } = await generateText({
      model,
      prompt: YOUTUBE_PROMPT + transcript,
    });

    const parsed = parseJson(text);
    const lesson: YouTubeMicroLesson = { ...parsed, videoId, embedUrl };
    return NextResponse.json({ lesson, remaining });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al importar";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

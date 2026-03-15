/**
 * POST: genera una lección desde texto extraído de PDF/PPT o desde extractedText.
 * Body: FormData con "file" (PDF/PPTX) O JSON con { extractedText: string }.
 * Devuelve preview editable: { title, objective, blocks[], quiz[] }.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import { checkAdminAIRateLimit } from "@/lib/rate-limit";
import { extractText } from "@/lib/services/documentParser";
import { generateText } from "ai";
import { getModelWithFallback } from "@/lib/ai/providers";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const LESSON_PROMPT = `Eres un diseñador instruccional experto. Convierte este contenido en una lección e-learning.

Genera:
- title: título corto de la lección
- objective: objetivo de aprendizaje (verbo en taxonomía de Bloom + redacción clara)
- blocks: array de 3 a 5 bloques de contenido. Cada bloque: { heading: string, body: string } (body en Markdown, párrafos breves)
- quiz: array de exactamente 3 preguntas. Cada una: { question: string, correctAnswer: string, wrongOptions: string[] (3 opciones incorrectas), explanation: string }

Responde ÚNICAMENTE con un JSON válido, sin markdown ni texto adicional, en este formato exacto:
{"title":"...","objective":"...","blocks":[{"heading":"...","body":"..."}],"quiz":[{"question":"...","correctAnswer":"...","wrongOptions":["...","...","..."],"explanation":"..."}]}

Contenido a convertir:

`;

export interface GeneratedLesson {
  title: string;
  objective: string;
  blocks: { heading: string; body: string }[];
  quiz: { question: string; correctAnswer: string; wrongOptions: string[]; explanation: string }[];
}

function parseGeneratedJson(text: string): GeneratedLesson {
  const cleaned = text.replace(/^[\s\S]*?(\{[\s\S]*\})[\s\S]*$/, "$1").trim();
  const parsed = JSON.parse(cleaned) as GeneratedLesson;
  if (!parsed.title || !Array.isArray(parsed.blocks)) throw new Error("JSON inválido");
  parsed.blocks = (parsed.blocks || []).slice(0, 10).map((b) => ({
    heading: typeof b.heading === "string" ? b.heading : "",
    body: typeof b.body === "string" ? b.body : "",
  }));
  parsed.quiz = (parsed.quiz || []).slice(0, 5).map((q) => ({
    question: typeof q.question === "string" ? q.question : "",
    correctAnswer: typeof q.correctAnswer === "string" ? q.correctAnswer : "",
    wrongOptions: Array.isArray(q.wrongOptions) ? q.wrongOptions.map(String).slice(0, 4) : [],
    explanation: typeof q.explanation === "string" ? q.explanation : "",
  }));
  return parsed;
}

const DEMO_LESSON: GeneratedLesson = {
  title: "Introducción a la política digital",
  objective: "Comprender los conceptos básicos de política digital (Bloom: comprender).",
  blocks: [
    { heading: "¿Qué es la política digital?", body: "La política digital se refiere al uso de tecnologías y datos en el diseño e implementación de políticas públicas." },
    { heading: "Beneficios", body: "Mayor eficiencia, transparencia y participación ciudadana." },
  ],
  quiz: [
    { question: "¿Qué es la política digital?", correctAnswer: "Uso de tecnologías en políticas públicas", wrongOptions: ["Solo redes sociales", "Solo gobierno electrónico", "Solo datos abiertos"], explanation: "Incluye tecnologías, datos y diseño de políticas." },
  ],
};

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });

    const { ok, remaining } = checkAdminAIRateLimit(auth.uid);
    if (!ok) return NextResponse.json({ error: "Límite de generaciones diarias alcanzado (10/día). Intenta mañana." }, { status: 429 });

    let extractedTextValue = "";

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file || file.size === 0) return NextResponse.json({ error: "Falta archivo o está vacío" }, { status: 400 });
      if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Archivo demasiado grande (máx 10 MB)" }, { status: 400 });
      const buffer = Buffer.from(await file.arrayBuffer());
      const name = file.name || "";
      const mime = file.type || "";
      if (getDemoMode()) {
        extractedTextValue = "Contenido de ejemplo en modo demo. En producción se extraería el texto del PDF o PPT.";
      } else {
        extractedTextValue = await extractText(buffer, mime, name);
      }
    } else {
      const body = await req.json().catch(() => ({}));
      extractedTextValue = (body.extractedText as string)?.trim() ?? "";
      if (!extractedTextValue) return NextResponse.json({ error: "Falta extractedText o archivo" }, { status: 400 });
    }

    if (extractedTextValue.length > 120000) extractedTextValue = extractedTextValue.slice(0, 120000) + "\n[... texto truncado ...]";

    if (getDemoMode()) {
      return NextResponse.json({
        lesson: DEMO_LESSON,
        remaining,
        message: "Modo demo: respuesta simulada.",
      });
    }

    const { model } = await getModelWithFallback("anthropic");
    const { text } = await generateText({
      model,
      prompt: LESSON_PROMPT + extractedTextValue,
    });

    const lesson = parseGeneratedJson(text);
    return NextResponse.json({ lesson, remaining });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al generar";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

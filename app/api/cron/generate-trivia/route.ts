/**
 * Cron semanal: genera 5 preguntas de trivia con Claude y las guarda en Firestore.
 * Ejecutar cada lunes (o domingo noche) con CRON_SECRET.
 * Genera para la semana actual (weekId = lunes).
 */
import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { getModelWithFallback } from "@/lib/ai/providers";
import { getDemoMode } from "@/lib/env";
import * as labTrivia from "@/lib/services/lab-trivia";
import type { TriviaQuestion } from "@/lib/services/lab-trivia";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const TRIVIA_PROMPT = `Genera exactamente 5 preguntas de trivia sobre innovación pública, gobierno digital o casos reales de transformación del Estado en Chile y Latinoamérica.

Requisitos:
- Preguntas específicas, con casos reales y fechas cuando sea relevante.
- Cada pregunta con 4 opciones (solo una correcta).
- Incluye una explicación breve para la respuesta correcta.

Responde ÚNICAMENTE con un JSON válido, sin markdown ni texto adicional. Formato exacto:
[
  {"question": "...", "options": ["opción A", "opción B", "opción C", "opción D"], "correctIndex": 0, "explanation": "..."},
  ...
]
correctIndex es el índice de la opción correcta (0 a 3).`;

function parseTriviaJson(text: string): TriviaQuestion[] {
  const cleaned = text.replace(/^[\s\S]*?(\[[\s\S]*\])\s*$/m, "$1").trim();
  const parsed = JSON.parse(cleaned) as unknown[];
  const questions: TriviaQuestion[] = [];
  for (const item of parsed.slice(0, 5)) {
    const q = item as Record<string, unknown>;
    const options = Array.isArray(q.options) ? q.options.map(String) : [];
    const correctIndex = typeof q.correctIndex === "number" ? Math.max(0, Math.min(3, q.correctIndex)) : 0;
    questions.push({
      question: typeof q.question === "string" ? q.question : "",
      options: options.length >= 4 ? options.slice(0, 4) : ["A", "B", "C", "D"],
      correctIndex,
      explanation: typeof q.explanation === "string" ? q.explanation : "",
    });
  }
  return questions;
}

export async function GET(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ ok: true, message: "Demo: no se generan preguntas" });
  const secret = req.headers.get("authorization")?.replace("Bearer ", "") ?? req.nextUrl.searchParams.get("secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const weekId = labTrivia.getWeekId();
    const { model } = await getModelWithFallback("anthropic");
    const { text } = await generateText({
      model,
      prompt: TRIVIA_PROMPT,
    });
    const questions = parseTriviaJson(text);
    if (questions.length < 5) {
      return NextResponse.json({ error: "Claude no devolvió 5 preguntas válidas", count: questions.length }, { status: 500 });
    }
    await labTrivia.setWeeklyQuestions(weekId, questions);
    return NextResponse.json({ ok: true, weekId, count: questions.length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al generar trivia";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST: genera estructura de lección (objetivo, introduccion, desarrollo, actividad, quiz) desde experiencia real.
 * Usa Claude. El alumno revisa y puede editar antes de enviar la propuesta.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import { generateText } from "ai";
import { getModelWithFallback } from "@/lib/ai/providers";
import type { ContenidoGenerado } from "@/lib/types/lessonProposal";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const PROMPT = `Eres un diseñador instruccional. A partir de la experiencia real de un servidor público, genera una lección e-learning estructurada.

Genera ÚNICAMENTE un JSON válido, sin markdown ni texto adicional, en este formato exacto:
{
  "objetivo": "Objetivo de aprendizaje en una frase (verbo Bloom + redacción clara)",
  "introduccion": "Párrafo de introducción al tema (2-4 oraciones, Markdown permitido)",
  "desarrollo": "Contenido principal desarrollado en secciones (Markdown, varios párrafos)",
  "actividad": "Actividad práctica o reflexión para el alumno (instrucciones claras)",
  "quiz": [
    { "question": "Pregunta 1", "correctAnswer": "Respuesta correcta", "wrongOptions": ["A", "B", "C"], "explanation": "Por qué" },
    { "question": "Pregunta 2", "correctAnswer": "Respuesta correcta", "wrongOptions": ["A", "B", "C"], "explanation": "Por qué" },
    { "question": "Pregunta 3", "correctAnswer": "Respuesta correcta", "wrongOptions": ["A", "B", "C"], "explanation": "Por qué" }
  ]
}

Debe haber exactamente 3 preguntas en quiz. wrongOptions debe ser un array de 3 strings.
Experiencia real del servidor público:

`;

function parseGeneratedJson(text: string): ContenidoGenerado {
  const cleaned = text.replace(/^[\s\S]*?(\{[\s\S]*\})[\s\S]*$/, "$1").trim();
  const parsed = JSON.parse(cleaned) as ContenidoGenerado;
  if (!parsed.objetivo || !parsed.quiz) throw new Error("JSON inválido");
  parsed.introduccion = typeof parsed.introduccion === "string" ? parsed.introduccion : "";
  parsed.desarrollo = typeof parsed.desarrollo === "string" ? parsed.desarrollo : "";
  parsed.actividad = typeof parsed.actividad === "string" ? parsed.actividad : "";
  parsed.quiz = (parsed.quiz || []).slice(0, 5).map((q) => ({
    question: typeof q.question === "string" ? q.question : "",
    correctAnswer: typeof q.correctAnswer === "string" ? q.correctAnswer : "",
    wrongOptions: Array.isArray(q.wrongOptions) ? q.wrongOptions.map(String).slice(0, 4) : [],
    explanation: typeof q.explanation === "string" ? q.explanation : "",
  }));
  return parsed;
}

const DEMO_CONTENIDO: ContenidoGenerado = {
  objetivo: "Aplicar buenas prácticas de simplificación administrativa a partir de experiencia real (Bloom: aplicar).",
  introduccion: "La experiencia en instituciones públicas permite identificar patrones que mejoran la atención ciudadana.",
  desarrollo: "En el IMSS implementamos mesas de simplificación que redujeron tiempos de trámite. Clave: escuchar al usuario y mapear pasos innecesarios.",
  actividad: "Reflexiona: ¿qué trámite de tu área podrías simplificar y qué evidencia usarías?",
  quiz: [
    { question: "¿Qué es fundamental al simplificar?", correctAnswer: "Escuchar al usuario", wrongOptions: ["Aumentar requisitos", "Digitalizar todo", "Centralizar"], explanation: "La voz del usuario guía la mejora." },
    { question: "¿Qué tipo de evidencia ayuda?", correctAnswer: "Tiempos y pasos actuales", wrongOptions: ["Solo quejas", "Solo encuestas", "Solo normativa"], explanation: "Medir antes y después." },
    { question: "¿Quién debe participar?", correctAnswer: "Quienes hacen el trámite y quien lo recibe", wrongOptions: ["Solo TI", "Solo dirección", "Solo jurídico"], explanation: "Enfoque multiactor." },
  ],
};

export async function POST(req: NextRequest) {
  if (!useFirebase()) {
    return NextResponse.json({ error: "No disponible" }, { status: 404 });
  }
  try {
    const auth = await getAuthFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const experienciaReal = typeof body.experienciaReal === "string" ? body.experienciaReal.trim() : "";
    if (!experienciaReal) {
      return NextResponse.json({ error: "Falta experienciaReal" }, { status: 400 });
    }
    if (experienciaReal.length > 25000) {
      return NextResponse.json({ error: "Texto demasiado largo" }, { status: 400 });
    }

    if (getDemoMode()) {
      return NextResponse.json({ contenidoGenerado: DEMO_CONTENIDO });
    }

    const { model } = await getModelWithFallback("anthropic");
    const { text } = await generateText({
      model,
      prompt: PROMPT + experienciaReal,
    });

    const contenidoGenerado = parseGeneratedJson(text);
    return NextResponse.json({ contenidoGenerado });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al generar";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

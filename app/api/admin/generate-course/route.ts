/**
 * POST: genera estructura de curso con IA desde tema, audiencia, duración, nivel.
 * Body: { topic, audience, durationTotal, level }.
 * Devuelve preview: name, description, modules[], lessons[], evaluation, bloomByModule.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode } from "@/lib/env";
import { checkAdminAIRateLimit } from "@/lib/rate-limit";
import { generateText } from "ai";
import { getModelWithFallback } from "@/lib/ai/providers";

export const dynamic = "force-dynamic";
export const maxDuration = 90;

const COURSE_PROMPT = `Eres un diseñador instruccional. Genera la estructura de un curso e-learning en JSON.

Entrada: tema, audiencia, duración total (ej. "8 horas"), nivel (principiante/intermedio/avanzado).

Genera:
- name: nombre del curso
- description: descripción breve (2-3 oraciones)
- modules: array de 4 a 6 módulos. Cada uno: { title, objective (objetivo SMART), bloom (verbo de taxonomía de Bloom) }
- lessons: array de lecciones. Cada una: { moduleIndex (0-based), title, type: "lectura"|"video"|"quiz" }
  (3-4 lecciones por módulo, variando tipos)
- evaluation: descripción breve de la evaluación final sugerida
- bloomByModule: array de strings, uno por módulo, ej. "Comprender, Aplicar"

Responde ÚNICAMENTE con un JSON válido en este formato (sin markdown):
{"name":"...","description":"...","modules":[{"title":"...","objective":"...","bloom":"..."}],"lessons":[{"moduleIndex":0,"title":"...","type":"lectura"}],"evaluation":"...","bloomByModule":["..."]}

Datos del curso:
Tema: 
Audiencia: 
Duración total: 
Nivel: 
`;

export interface GeneratedCourseStructure {
  name: string;
  description: string;
  modules: { title: string; objective: string; bloom: string }[];
  lessons: { moduleIndex: number; title: string; type: "lectura" | "video" | "quiz" }[];
  evaluation: string;
  bloomByModule: string[];
}

const DEMO_STRUCTURE: GeneratedCourseStructure = {
  name: "Introducción a la Política Digital",
  description: "Curso para comprender los fundamentos de la política digital en el sector público.",
  modules: [
    { title: "Fundamentos", objective: "Al finalizar el participante comprenderá los conceptos básicos.", bloom: "Comprender" },
    { title: "Herramientas", objective: "El participante aplicará herramientas de diagnóstico.", bloom: "Aplicar" },
  ],
  lessons: [
    { moduleIndex: 0, title: "¿Qué es política digital?", type: "lectura" },
    { moduleIndex: 0, title: "Caso de estudio", type: "video" },
    { moduleIndex: 1, title: "Matriz de madurez", type: "lectura" },
  ],
  evaluation: "Quiz final por módulo y entrega de caso aplicado.",
  bloomByModule: ["Comprender", "Aplicar"],
};

function parseJson(text: string): GeneratedCourseStructure {
  const cleaned = text.replace(/^[\s\S]*?(\{[\s\S]*\})[\s\S]*$/, "$1").trim();
  const parsed = JSON.parse(cleaned);
  return {
    name: String(parsed.name ?? ""),
    description: String(parsed.description ?? ""),
    modules: Array.isArray(parsed.modules) ? parsed.modules.slice(0, 10).map((m: { title?: string; objective?: string; bloom?: string }) => ({
      title: String(m?.title ?? ""),
      objective: String(m?.objective ?? ""),
      bloom: String(m?.bloom ?? ""),
    })) : [],
    lessons: Array.isArray(parsed.lessons) ? parsed.lessons.slice(0, 50).map((l: { moduleIndex?: number; title?: string; type?: string }) => ({
      moduleIndex: Number(l?.moduleIndex ?? 0),
      title: String(l?.title ?? ""),
      type: (l?.type === "video" || l?.type === "quiz" ? l.type : "lectura") as "lectura" | "video" | "quiz",
    })) : [],
    evaluation: String(parsed.evaluation ?? ""),
    bloomByModule: Array.isArray(parsed.bloomByModule) ? parsed.bloomByModule.map(String) : [],
  };
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    const { ok, remaining } = checkAdminAIRateLimit(auth.uid);
    if (!ok) return NextResponse.json({ error: "Límite diario alcanzado" }, { status: 429 });
    const body = await req.json().catch(() => ({}));
    const topic = (body.topic as string)?.trim() ?? "";
    const audience = (body.audience as string)?.trim() ?? "";
    const durationTotal = (body.durationTotal as string)?.trim() ?? "";
    const level = (body.level as string)?.trim() ?? "";
    if (!topic) return NextResponse.json({ error: "Falta tema" }, { status: 400 });

    if (getDemoMode()) {
      return NextResponse.json({ structure: DEMO_STRUCTURE, remaining });
    }

    const prompt = COURSE_PROMPT.replace("Tema:", `Tema: ${topic}`)
      .replace("Audiencia:", `Audiencia: ${audience}`)
      .replace("Duración total:", `Duración total: ${durationTotal}`)
      .replace("Nivel:", `Nivel: ${level}`);
    const { model } = await getModelWithFallback("anthropic");
    const { text } = await generateText({ model, prompt });
    const structure = parseJson(text);
    return NextResponse.json({ structure, remaining });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

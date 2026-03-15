/**
 * POST /api/simulador/evaluar — evalúa respuestas con Claude y guarda resultado (Brecha 2).
 * Body: { simulationId: string, answers: string[] }
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getSimulation } from "@/lib/services/simulations";
import {
  saveUserSimulationResult,
  getCohortAverageScore,
} from "@/lib/services/simulations";
import * as profile from "@/lib/services/profile";
import { SIMULATION_QUESTIONS } from "@/lib/types/simulador";
import type { SimulationEvaluation } from "@/lib/types/simulador";
import { generateText } from "ai";
import { getModelWithFallback } from "@/lib/ai/providers";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function parseEvaluationJson(text: string): SimulationEvaluation | null {
  const cleaned = text.replace(/```json\s?/g, "").replace(/```\s?/g, "").trim();
  try {
    const parsed = JSON.parse(cleaned) as Record<string, unknown>;
    const scoreTotal = typeof parsed.scoreTotal === "number" ? parsed.scoreTotal : 0;
    const scoresPorCriterio = (parsed.scoresPorCriterio as Record<string, number>) ?? {};
    const fortalezas = Array.isArray(parsed.fortalezas) ? (parsed.fortalezas as string[]) : [];
    const areasdemejora = Array.isArray(parsed.areasdemejora) ? (parsed.areasdemejora as string[]) : [];
    const retroalimentacion = typeof parsed.retroalimentacion === "string" ? parsed.retroalimentacion : "";
    const decisionClave = typeof parsed.decisionClave === "string" ? parsed.decisionClave : "";
    const errorCritico = typeof parsed.errorCritico === "string" ? parsed.errorCritico : "";
    const nivelEstrategico =
      parsed.nivelEstrategico === "operativo" ||
      parsed.nivelEstrategico === "tactico" ||
      parsed.nivelEstrategico === "estrategico"
        ? parsed.nivelEstrategico
        : "tactico";
    return {
      scoreTotal: Math.min(100, Math.max(0, scoreTotal)),
      scoresPorCriterio,
      fortalezas,
      areasdemejora,
      retroalimentacion,
      decisionClave,
      errorCritico,
      nivelEstrategico,
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    const body = await req.json();
    const simulationId = body?.simulationId?.trim();
    const answers = Array.isArray(body?.answers) ? body.answers.map(String) : [];
    if (!simulationId || answers.length !== SIMULATION_QUESTIONS.length) {
      return NextResponse.json(
        { error: "Faltan simulationId o answers (5 respuestas)" },
        { status: 400 }
      );
    }

    const simulation = await getSimulation(simulationId);
    if (!simulation) {
      return NextResponse.json({ error: "Simulación no encontrada" }, { status: 404 });
    }

    if (getDemoMode()) {
      const demoEval: SimulationEvaluation = {
        scoreTotal: 78,
        scoresPorCriterio: Object.fromEntries(
          simulation.criterios.map((c) => [c, 70 + Math.floor(Math.random() * 25)])
        ),
        fortalezas: ["Claridad en el primer movimiento", "Buena comunicación"],
        areasdemejora: ["Profundizar en KPIs"],
        retroalimentacion:
          "Demo: tu respuesta fue evaluada. En producción Claude dará retroalimentación detallada.",
        decisionClave: "Definir el primer movimiento en 48 horas",
        errorCritico: "Ninguno crítico en esta demo",
        nivelEstrategico: "tactico",
      };
      return NextResponse.json({
        evaluation: demoEval,
        cohortAverage: 72,
      });
    }

    const { model } = await getModelWithFallback("anthropic");
    const answersBlock = answers
      .map((a: string, i: number) => `${i + 1}. ${SIMULATION_QUESTIONS[i]}: ${a}`)
      .join("\n");

    const prompt = `Eres un experto en política pública mexicana y transformación digital del gobierno.

Escenario: ${simulation.titulo}
Contexto: ${simulation.contexto}
Presupuesto: ${simulation.presupuesto}
Tiempo: ${simulation.tiempo}
Equipo: ${simulation.equipo}

Respuestas del servidor público:
${answersBlock}

Evalúa las respuestas con estos criterios: ${simulation.criterios.join(", ")}.

Responde ÚNICAMENTE con un JSON válido (sin markdown, sin texto antes o después):
{
  "scoreTotal": number (0-100),
  "scoresPorCriterio": { "criterio": number },
  "fortalezas": ["string"],
  "areasdemejora": ["string"],
  "retroalimentacion": "string (hasta 300 palabras, tono de mentor experto)",
  "decisionClave": "string (la decisión más importante que tomó bien)",
  "errorCritico": "string (el error más importante a corregir)",
  "nivelEstrategico": "operativo" | "tactico" | "estrategico"
}

Criterios a usar como claves en scoresPorCriterio: ${simulation.criterios.map((c) => `"${c}"`).join(", ")}.`;

    const { text } = await generateText({ model, prompt });
    const evaluation = parseEvaluationJson(text);
    if (!evaluation) {
      return NextResponse.json(
        { error: "No se pudo interpretar la evaluación de Claude" },
        { status: 500 }
      );
    }

    if (useFirebase()) {
      await saveUserSimulationResult(auth.uid, simulationId, {
        evaluation,
        answers,
      });
      if (evaluation.scoreTotal > 75) {
        profile.setBadge(auth.uid, "estratega").catch(() => {});
      }
    }

    const cohortAverage = await getCohortAverageScore(simulationId);

    return NextResponse.json({
      evaluation,
      cohortAverage,
    });
  } catch (e) {
    console.error("Simulador evaluar:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al evaluar" },
      { status: 500 }
    );
  }
}

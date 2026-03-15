/**
 * POST /api/portafolio/evaluar — Claude evalúa el proyecto (Brecha 5).
 * Body: datos del proyecto (titulo, institucion, problema, solucion, resultado, ciudadanosBeneficiados, modulos).
 * Devuelve: evaluacionClaude, scoreImpacto, sugerencias.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as portfolio from "@/lib/services/portfolio";
import type { PortfolioEvaluacion } from "@/lib/types/portfolio";
import { generateText } from "ai";
import { getModelWithFallback } from "@/lib/ai/providers";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function parseEvaluationJson(text: string): PortfolioEvaluacion | null {
  const cleaned = text.replace(/```json\s?/g, "").replace(/```\s?/g, "").trim();
  try {
    const parsed = JSON.parse(cleaned) as Record<string, unknown>;
    const evaluacionClaude = typeof parsed.evaluacionClaude === "string" ? parsed.evaluacionClaude : "";
    const scoreImpacto = typeof parsed.scoreImpacto === "number" ? Math.min(100, Math.max(0, parsed.scoreImpacto)) : 0;
    const sugerencias = Array.isArray(parsed.sugerencias) ? (parsed.sugerencias as string[]) : undefined;
    return { evaluacionClaude, scoreImpacto, sugerencias };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const projectId = typeof body.projectId === "string" ? body.projectId.trim() : null;
    const titulo = typeof body.titulo === "string" ? body.titulo.trim() : "";
    const institucion = typeof body.institucion === "string" ? body.institucion.trim() : "";
    const problema = typeof body.problema === "string" ? body.problema.trim() : "";
    const solucion = typeof body.solucion === "string" ? body.solucion.trim() : "";
    const resultado = typeof body.resultado === "string" ? body.resultado.trim() : "";
    const ciudadanosBeneficiados = typeof body.ciudadanosBeneficiados === "number" ? body.ciudadanosBeneficiados : Number(body.ciudadanosBeneficiados) || 0;
    const modulos = Array.isArray(body.modulos) ? body.modulos.map(String) : [];

    if (!problema || !solucion) {
      return NextResponse.json(
        { error: "Faltan problema o solucion para evaluar" },
        { status: 400 }
      );
    }

    if (getDemoMode()) {
      const demo: PortfolioEvaluacion = {
        evaluacionClaude: "Demo: tu proyecto muestra claridad en el problema y una solución concreta. En producción Claude dará retroalimentación detallada sobre claridad, viabilidad, impacto y conexión con el programa.",
        scoreImpacto: 72,
        sugerencias: ["Incluir más evidencia cuantitativa del impacto", "Vincular explícitamente con los módulos usados"],
      };
      return NextResponse.json({ evaluacion: demo });
    }

    const { model } = await getModelWithFallback("anthropic");
    const prompt = `Eres un experto en política pública y transformación digital en gobierno.

Evalúa este proyecto de transformación documentado por un servidor público que completó un programa de formación:

- Título: ${titulo || "(sin título)"}
- Institución: ${institucion || "(no indicada)"}
- Problema que identificó: ${problema}
- Solución que diseñó o implementó: ${solucion}
- Resultado / impacto medible: ${resultado || "(no indicado)"}
- Ciudadanos o empleados beneficiados: ${ciudadanosBeneficiados}
- Módulos del programa que usó: ${modulos.length ? modulos.join(", ") : "(no indicados)"}

Criterios de evaluación:
1. Claridad del problema
2. Viabilidad de la solución
3. Impacto medible en ciudadanos
4. Conexión con el aprendizaje del programa
5. Potencial de escalabilidad

Responde ÚNICAMENTE con un JSON válido (sin markdown, sin texto antes o después):
{
  "evaluacionClaude": "string (retroalimentación en 2-4 párrafos, tono de mentor, en español)",
  "scoreImpacto": number (0-100, refleja el impacto y la calidad del proyecto),
  "sugerencias": ["string", "string"] (2-4 sugerencias concretas para mejorar el proyecto o su documentación)
}`;

    const { text } = await generateText({ model, prompt });
    const evaluacion = parseEvaluationJson(text);
    if (!evaluacion) {
      return NextResponse.json(
        { error: "No se pudo interpretar la evaluación de Claude" },
        { status: 500 }
      );
    }

    if (useFirebase() && projectId) {
      await portfolio.updateProject(auth.uid, projectId, {
        evaluacionClaude: evaluacion.evaluacionClaude,
        scoreImpacto: evaluacion.scoreImpacto,
      });
    }

    return NextResponse.json({ evaluacion });
  } catch (e) {
    console.error("Portafolio evaluar:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al evaluar" },
      { status: 500 }
    );
  }
}

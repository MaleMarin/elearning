/**
 * Moderación automática de contenido con Claude.
 * Evalúa texto y devuelve aprobado, razón y nivel (seguro | revision | bloqueado).
 */

import { generateText } from "ai";
import { getModelWithFallback } from "@/lib/ai/providers";

export type NivelModeracion = "seguro" | "revision" | "bloqueado";

export interface ResultadoModeracion {
  aprobado: boolean;
  razon: string;
  nivel: NivelModeracion;
}

const PROMPT = `Eres moderador de una plataforma de capacitación del gobierno mexicano.
Evalúa si este texto es apropiado para publicarse (respetuoso, sin discurso de odio, sin spam, sin datos personales sensibles).
Responde ÚNICAMENTE con un JSON válido, sin markdown ni texto extra:
{"aprobado": boolean, "razon": string, "nivel": "seguro"|"revision"|"bloqueado"}

- seguro: contenido adecuado, publicar sin revisión.
- revision: dudoso o límite, publicar pero marcar para revisión humana.
- bloqueado: inapropiado, no publicar.

Texto a evaluar:`;

export async function moderarContenido(texto: string): Promise<ResultadoModeracion> {
  const trimmed = (texto ?? "").trim().slice(0, 8000);
  if (!trimmed) {
    return { aprobado: true, razon: "Texto vacío", nivel: "seguro" };
  }

  try {
    const { model } = await getModelWithFallback("anthropic");
    const { text } = await generateText({
      model,
      prompt: PROMPT + "\n\n" + JSON.stringify(trimmed),
    });

    const cleaned = text.replace(/^[\s\S]*?(\{[\s\S]*\})\s*$/m, "$1").trim();
    const parsed = JSON.parse(cleaned) as { aprobado?: boolean; razon?: string; nivel?: string };

    const nivel = ["seguro", "revision", "bloqueado"].includes(parsed.nivel ?? "")
      ? (parsed.nivel as NivelModeracion)
      : "revision";
    const aprobado = nivel === "bloqueado" ? false : Boolean(parsed.aprobado !== false);
    const razon = String(parsed.razon ?? "").slice(0, 500) || (nivel === "bloqueado" ? "Contenido inapropiado" : "Revisión automática");

    return { aprobado, razon, nivel };
  } catch (e) {
    console.error("Moderación falló, asumiendo revision:", e);
    return {
      aprobado: true,
      razon: "Error de moderación automática; requiere revisión humana",
      nivel: "revision",
    };
  }
}

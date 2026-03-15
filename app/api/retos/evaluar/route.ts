/**
 * POST /api/retos/evaluar — Claude evalúa todas las propuestas de los equipos (Brecha 8).
 * Body: { cohortId, challengeId }. Solo admin o cuando estado es "evaluando".
 * Genera score + retro por equipo, guarda en Firestore, marca ganador (mayor score), estado completado.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as challenges from "@/lib/services/cohort-challenges";
import * as profile from "@/lib/services/profile";
import type { EvaluationScore } from "@/lib/types/cohort-challenge";
import { generateText } from "ai";
import { getModelWithFallback } from "@/lib/ai/providers";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

function parseTeamScoresJson(text: string): { teamId: string; score: number; retroalimentacion: string }[] | null {
  const cleaned = text.replace(/```json\s?/g, "").replace(/```\s?/g, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    const arr = Array.isArray(parsed) ? parsed : (parsed.equipos ? parsed.equipos : null);
    if (!Array.isArray(arr)) return null;
    return arr.map((e: Record<string, unknown>) => ({
      teamId: String(e.teamId ?? e.id ?? ""),
      score: Math.min(100, Math.max(0, Number(e.score ?? 0))),
      retroalimentacion: String(e.retroalimentacion ?? e.retro ?? ""),
    }));
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const cohortId = typeof body.cohortId === "string" ? body.cohortId.trim() : "";
    const challengeId = typeof body.challengeId === "string" ? body.challengeId.trim() : "";
    if (!cohortId || !challengeId) return NextResponse.json({ error: "cohortId y challengeId requeridos" }, { status: 400 });

    const challenge = await challenges.getChallenge(cohortId, challengeId);
    if (!challenge) return NextResponse.json({ error: "Reto no encontrado" }, { status: 404 });
    if (auth.role !== "admin" && challenge.estado !== "evaluando") {
      return NextResponse.json({ error: "Solo administradores pueden iniciar la evaluación" }, { status: 403 });
    }

    const teamsWithPropuesta = challenge.equipos.filter((t) => t.propuesta.trim().length > 0 && t.submittedAt);
    if (teamsWithPropuesta.length === 0) {
      return NextResponse.json({ error: "No hay propuestas entregadas para evaluar" }, { status: 400 });
    }

    if (getDemoMode()) {
      for (const t of teamsWithPropuesta) {
        await challenges.setTeamScores(cohortId, challengeId, t.id, {
          score: 70 + Math.floor(Math.random() * 25),
          retroalimentacion: "Demo: retroalimentación de Claude para " + t.nombre,
        });
      }
      const winner = teamsWithPropuesta[0];
      await challenges.setChallengeGanador(cohortId, challengeId, winner.id);
      await challenges.updateChallengeEstado(cohortId, challengeId, "completado");
      if (useFirebase()) profile.setBadge(winner.miembros[0], "estratega").catch(() => {});
      return NextResponse.json({ ok: true, ganador: winner.id });
    }

    const { model } = await getModelWithFallback("anthropic");
    const criterios = challenge.criteriosEvaluacion.length ? challenge.criteriosEvaluacion.join(", ") : "Viabilidad, Impacto, Creatividad, Factibilidad presupuestal";
    const equiposBlock = teamsWithPropuesta
      .map(
        (t) =>
          `Equipo ID: ${t.id}\nNombre: ${t.nombre}\nPropuesta:\n${t.propuesta}\n---`
      )
      .join("\n\n");

    const prompt = `Eres un experto en política pública. Evalúa las siguientes propuestas de equipos de una cohorte.

Reto: ${challenge.titulo}
Descripción: ${challenge.descripcion}
Criterios de evaluación: ${criterios}

Propuestas de los equipos:

${equiposBlock}

Responde ÚNICAMENTE con un JSON válido. Un array de objetos, uno por equipo, con:
- teamId: string (el ID del equipo, exactamente como aparece arriba)
- score: number (0-100)
- retroalimentacion: string (2-4 oraciones de retroalimentación constructiva en español)

Ejemplo: [{"teamId":"abc","score":85,"retroalimentacion":"..."}, ...]`;

    const { text } = await generateText({ model, prompt });
    const scores = parseTeamScoresJson(text);
    if (!scores || scores.length === 0) return NextResponse.json({ error: "No se pudo interpretar la evaluación" }, { status: 500 });

    for (const s of scores) {
      const team = teamsWithPropuesta.find((t) => t.id === s.teamId);
      if (team) {
        await challenges.setTeamScores(cohortId, challengeId, s.teamId, {
          score: s.score,
          retroalimentacion: s.retroalimentacion,
        });
      }
    }

    const ordered = [...scores].sort((a, b) => b.score - a.score);
    const ganadorId = ordered[0]?.teamId ?? null;
    if (ganadorId) {
      await challenges.setChallengeGanador(cohortId, challengeId, ganadorId);
      const winnerTeam = challenge.equipos.find((t) => t.id === ganadorId);
      if (winnerTeam && useFirebase()) {
        for (const uid of winnerTeam.miembros) {
          profile.setBadge(uid, "estratega").catch(() => {});
        }
      }
    }
    await challenges.updateChallengeEstado(cohortId, challengeId, "completado");

    return NextResponse.json({ ok: true, ganador: ganadorId });
  } catch (e) {
    console.error("Retos evaluar:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error al evaluar" }, { status: 500 });
  }
}

/**
 * PATCH: actualizar estado del reto (proximo | activo | evaluando | completado) — Brecha 8.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as challenges from "@/lib/services/cohort-challenges";
import type { ChallengeEstado } from "@/lib/types/cohort-challenge";

export const dynamic = "force-dynamic";

const VALID_ESTADOS: ChallengeEstado[] = ["proximo", "activo", "evaluando", "completado"];

function isChallengeEstado(s: string): s is ChallengeEstado {
  return (VALID_ESTADOS as readonly string[]).includes(s);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; challengeId: string }> }
) {
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    const { id: cohortId, challengeId } = await params;
    if (!cohortId || !challengeId) return NextResponse.json({ error: "Cohort id y challengeId requeridos" }, { status: 400 });
    const body = await req.json().catch(() => ({}));
    const estado = body.estado as string;
    if (!isChallengeEstado(estado)) return NextResponse.json({ error: "estado inválido" }, { status: 400 });
    await challenges.updateChallengeEstado(cohortId, challengeId, estado);
    const challenge = await challenges.getChallenge(cohortId, challengeId);
    return NextResponse.json({ challenge });
  } catch (e) {
    return NextResponse.json({ error: "Error al actualizar reto" }, { status: 500 });
  }
}

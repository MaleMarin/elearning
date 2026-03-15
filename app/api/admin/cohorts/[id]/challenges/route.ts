/**
 * GET: listar retos de la cohorte. POST: crear reto (Brecha 8).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as challenges from "@/lib/services/cohort-challenges";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthFromRequest(_req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    const { id: cohortId } = await params;
    if (!cohortId) return NextResponse.json({ error: "Cohort id requerido" }, { status: 400 });
    const list = await challenges.listChallengesByCohort(cohortId);
    return NextResponse.json({ challenges: list });
  } catch (e) {
    return NextResponse.json({ error: "Error al listar retos" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    const { id: cohortId } = await params;
    if (!cohortId) return NextResponse.json({ error: "Cohort id requerido" }, { status: 400 });
    const body = await req.json().catch(() => ({}));
    const titulo = typeof body.titulo === "string" ? body.titulo.trim() : "";
    const descripcion = typeof body.descripcion === "string" ? body.descripcion.trim() : "";
    const fechaInicio = typeof body.fechaInicio === "string" ? body.fechaInicio : "";
    const fechaFin = typeof body.fechaFin === "string" ? body.fechaFin : "";
    const criteriosEvaluacion = Array.isArray(body.criteriosEvaluacion) ? body.criteriosEvaluacion.map(String) : [];
    const premioDescripcion = typeof body.premioDescripcion === "string" ? body.premioDescripcion.trim() : "Badge + mención en el certificado";
    if (!titulo || !descripcion || !fechaInicio || !fechaFin) {
      return NextResponse.json({ error: "Faltan titulo, descripcion, fechaInicio o fechaFin" }, { status: 400 });
    }
    const challenge = await challenges.createChallenge(cohortId, {
      titulo,
      descripcion,
      fechaInicio,
      fechaFin,
      criteriosEvaluacion,
      premioDescripcion,
    });
    return NextResponse.json({ challenge });
  } catch (e) {
    return NextResponse.json({ error: "Error al crear reto" }, { status: 500 });
  }
}

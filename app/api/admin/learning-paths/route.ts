import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as learningPaths from "@/lib/services/learning-paths";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ paths: [] });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    const activeOnly = req.nextUrl.searchParams.get("active") !== "false";
    const paths = await learningPaths.listLearningPaths(activeOnly);
    return NextResponse.json({ paths });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ error: "Demo" }, { status: 400 });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    const body = await req.json().catch(() => ({}));
    const path = await learningPaths.createLearningPath({
      nombre: String(body.nombre ?? "").trim() || "Ruta sin nombre",
      descripcion: String(body.descripcion ?? "").trim(),
      cargosTarget: Array.isArray(body.cargosTarget) ? body.cargosTarget : [],
      institucionesTarget: Array.isArray(body.institucionesTarget) ? body.institucionesTarget : [],
      cursos: Array.isArray(body.cursos) ? body.cursos : [],
      activa: Boolean(body.activa !== false),
    });
    return NextResponse.json({ path });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

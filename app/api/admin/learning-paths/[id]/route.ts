import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { useFirebase } from "@/lib/env";
import * as learningPaths from "@/lib/services/learning-paths";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(_req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    const { id } = await params;
    const path = await learningPaths.getLearningPath(id);
    if (!path) return NextResponse.json({ error: "Ruta no encontrada" }, { status: 404 });
    return NextResponse.json({ path });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const path = await learningPaths.updateLearningPath(id, {
      nombre: typeof body.nombre === "string" ? body.nombre.trim() : undefined,
      descripcion: typeof body.descripcion === "string" ? body.descripcion.trim() : undefined,
      cargosTarget: Array.isArray(body.cargosTarget) ? body.cargosTarget : undefined,
      institucionesTarget: Array.isArray(body.institucionesTarget) ? body.institucionesTarget : undefined,
      cursos: Array.isArray(body.cursos) ? body.cursos : undefined,
      activa: typeof body.activa === "boolean" ? body.activa : undefined,
    });
    if (!path) return NextResponse.json({ error: "Ruta no encontrada" }, { status: 404 });
    return NextResponse.json({ path });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST /api/admin/competencias/seed — Ejecuta seed de las 8 competencias SPC si la colección está vacía. Solo admin.
 */
import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { seedDefaultCompetencias } from "@/lib/services/competencias";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ created: 0, message: "Modo demo" });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 404 });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    const { created } = await seedDefaultCompetencias();
    return NextResponse.json({ created, message: created ? "Competencias creadas." : "Ya existían." });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

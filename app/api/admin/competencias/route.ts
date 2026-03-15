import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { listCompetencias, seedDefaultCompetencias } from "@/lib/services/competencias";

export const dynamic = "force-dynamic";

/** GET: listar competencias SPC. Si la colección está vacía, hace seed de las 8 por defecto. Solo admin/mentor. */
export async function GET(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ competencias: [] });
  if (!useFirebase()) return NextResponse.json({ competencias: [] });
  try {
    const auth = await getAuthFromRequest(req);
    const role = auth?.role ?? "";
    if (role !== "admin" && role !== "mentor") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    let list = await listCompetencias();
    if (list.length === 0) {
      await seedDefaultCompetencias();
      list = await listCompetencias();
    }
    return NextResponse.json({ competencias: list });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

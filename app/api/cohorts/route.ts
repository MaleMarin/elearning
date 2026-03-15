/**
 * GET: lista de cohortes (id, name) para filtros. Cualquier usuario autenticado.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as firebaseContent from "@/lib/services/firebase-content";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (getDemoMode()) {
    return NextResponse.json({ cohorts: [{ id: "demo-cohort-id", name: "Cohorte demo" }] });
  }
  if (!useFirebase()) return NextResponse.json({ cohorts: [] });
  try {
    await getAuthFromRequest(req);
    const list = await firebaseContent.listCohorts();
    const cohorts = list.map((c) => ({ id: c.id as string, name: (c.name as string) ?? "Cohorte" }));
    return NextResponse.json({ cohorts });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

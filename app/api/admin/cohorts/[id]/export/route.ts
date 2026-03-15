import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as firebaseContent from "@/lib/services/firebase-content";

export const dynamic = "force-dynamic";

/** GET: exportar reporte CSV de progreso de la cohorte. */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (getDemoMode()) {
    const csv = "userId,displayName,progressPct\nu1,Alumno demo,45\nu2,Otro alumno,80\n";
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=cohorte-progreso.csv",
      },
    });
  }
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 404 });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin" && auth.role !== "mentor") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    const { id: cohortId } = await params;
    const cohort = await firebaseContent.getCohort(cohortId);
    const nombre = (cohort.nombre as string) ?? (cohort.name as string) ?? cohortId;
    const progress = await firebaseContent.listCohortAlumnosWithProgress(cohortId);
    const header = "userId,displayName,progressPct\n";
    const rows = progress
      .map(
        (r) =>
          `${r.userId},${escapeCsv(r.displayName ?? "")},${r.progressPct}`
      )
      .join("\n");
    const csv = "\uFEFF" + header + rows;
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${slug(nombre)}-progreso.csv"`,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

function escapeCsv(s: string): string {
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function slug(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .slice(0, 50);
}

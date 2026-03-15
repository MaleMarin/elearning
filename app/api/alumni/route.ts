/**
 * GET: lista egresados. Query: institution?, region?, cohortId?
 */
import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as alumni from "@/lib/services/alumni";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (getDemoMode()) {
    return NextResponse.json({
      alumni: [
        { userId: "a1", fullName: "Ana Pérez", institution: "Ministerio Salud", position: "Jefa de proyectos", region: "RM", cohortId: "c1", cohortName: "2025-1", linkedIn: null, createdAt: "" },
        { userId: "a2", fullName: "Luis Soto", institution: "ONG Transparencia", position: "Coordinador", region: "Valparaíso", cohortId: "c1", cohortName: "2025-1", linkedIn: "https://linkedin.com/in/luis", createdAt: "" },
      ],
    });
  }
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const u = req.nextUrl.searchParams;
    const filters: alumni.AlumniFilters = {
      institution: u.get("institution") ?? undefined,
      region: u.get("region") ?? undefined,
      cohortId: u.get("cohortId") ?? undefined,
    };
    const list = await alumni.listAlumni(filters);
    return NextResponse.json({ alumni: list });
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

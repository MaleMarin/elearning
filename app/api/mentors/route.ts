/**
 * GET: lista de mentores (sin datos de contacto).
 */
import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as mentors from "@/lib/services/mentors";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (getDemoMode()) {
    return NextResponse.json({
      mentors: [
        { userId: "m1", fullName: "María García", institution: "Ministerio Salud", position: "Jefa de proyectos", photoURL: null, cohortName: "Cohorte 2025-1", createdAt: "" },
        { userId: "m2", fullName: "Carlos López", institution: "ONG Transparencia", position: "Coordinador", photoURL: null, cohortName: "Cohorte 2025-1", createdAt: "" },
      ],
    });
  }
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const list = await mentors.listMentors();
    return NextResponse.json({ mentors: list });
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

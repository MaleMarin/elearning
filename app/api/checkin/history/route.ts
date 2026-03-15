/**
 * GET /api/checkin/history?weeks=4 — check-ins de las últimas N semanas (Brecha 4, perfil).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as checkinService from "@/lib/services/checkin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    const weeks = Math.min(12, Math.max(1, Number(req.nextUrl.searchParams.get("weeks")) || 4));

    if (getDemoMode()) {
      const demo: checkinService.Checkin[] = [];
      for (let i = 0; i < 14; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        demo.push({
          fecha: d.toISOString().slice(0, 10),
          energia: (i % 3) + 1 as 1 | 2 | 3,
          foco: ((i + 1) % 3) + 1 as 1 | 2 | 3,
          tiempoDisponible: [15, 30, 60][i % 3] as 5 | 15 | 30 | 60,
          recomendacion: "normal",
        });
      }
      return NextResponse.json({ checkins: demo });
    }
    if (!useFirebase()) {
      return NextResponse.json({ checkins: [] });
    }

    const checkins = await checkinService.getCheckinsLastWeeks(auth.uid, weeks);
    return NextResponse.json({ checkins });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

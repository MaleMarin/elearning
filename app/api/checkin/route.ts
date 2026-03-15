/**
 * GET /api/checkin?date=YYYY-MM-DD — obtiene el check-in del día (Brecha 4).
 * POST /api/checkin — guarda el check-in de hoy. Body: { energia, foco, tiempoDisponible }.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as checkinService from "@/lib/services/checkin";

export const dynamic = "force-dynamic";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    const date = req.nextUrl.searchParams.get("date") || today();

    if (getDemoMode()) {
      return NextResponse.json({
        checkin: null,
        recomendacion: null,
      });
    }
    if (!useFirebase()) {
      return NextResponse.json({ checkin: null, recomendacion: null });
    }

    const checkin = await checkinService.getCheckin(auth.uid, date);
    const recomendacion = checkin
      ? checkinService.calcularRecomendacion(checkin)
      : null;

    return NextResponse.json({
      checkin,
      recomendacion,
    });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    const body = await req.json();
    const energia = body?.energia as 1 | 2 | 3 | undefined;
    const foco = body?.foco as 1 | 2 | 3 | undefined;
    const tiempoDisponible = body?.tiempoDisponible as 5 | 15 | 30 | 60 | undefined;

    const validEnergia = [1, 2, 3].includes(Number(energia)) ? (energia as 1 | 2 | 3) : 2;
    const validFoco = [1, 2, 3].includes(Number(foco)) ? (foco as 1 | 2 | 3) : 2;
    const validTiempo = [5, 15, 30, 60].includes(Number(tiempoDisponible))
      ? (tiempoDisponible as 5 | 15 | 30 | 60)
      : 15;

    const fecha = today();

    if (getDemoMode()) {
      const rec = checkinService.calcularRecomendacion({
        fecha,
        energia: validEnergia,
        foco: validFoco,
        tiempoDisponible: validTiempo,
        recomendacion: "normal",
      });
      return NextResponse.json({
        checkin: { fecha, energia: validEnergia, foco: validFoco, tiempoDisponible: validTiempo, recomendacion: rec.tipo },
        recomendacion: rec,
      });
    }
    if (!useFirebase()) {
      return NextResponse.json({ error: "Check-in no disponible" }, { status: 501 });
    }

    const checkin = await checkinService.setCheckin(auth.uid, {
      fecha,
      energia: validEnergia,
      foco: validFoco,
      tiempoDisponible: validTiempo,
    });
    const recomendacion = checkinService.calcularRecomendacion(checkin);

    return NextResponse.json({
      checkin,
      recomendacion,
    });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

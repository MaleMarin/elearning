/**
 * Cron diario (Vercel Cron): lista usuarios con repasos pendientes.
 * Puede usarse para notificaciones in-app o email; no envía por defecto.
 * Verificación: CRON_SECRET en header.
 */
import { NextRequest, NextResponse } from "next/server";
import * as spacedRepetition from "@/lib/services/spacedRepetition";
import { getDemoMode } from "@/lib/env";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ ok: true, message: "Demo" });
  const secret = req.headers.get("authorization")?.replace("Bearer ", "") ?? req.nextUrl.searchParams.get("secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const users = await spacedRepetition.getUsersWithPendingReviews();
  return NextResponse.json({ ok: true, usersWithPending: users.length, users });
}

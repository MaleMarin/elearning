/**
 * Cron diario: obtiene usuarios con nudges pendientes.
 * Puede extenderse para enviar por email/WhatsApp según preferencias.
 * Verificación: CRON_SECRET en header o query.
 */
import { NextRequest, NextResponse } from "next/server";
import * as nudges from "@/lib/services/nudges";
import { getDemoMode } from "@/lib/env";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ ok: true, message: "Demo" });
  const secret = req.headers.get("authorization")?.replace("Bearer ", "") ?? req.nextUrl.searchParams.get("secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const users = await nudges.getUsersForNudgeCron();
  return NextResponse.json({ ok: true, usersWithNudges: users.length, users: users.map((u) => ({ uid: u.uid, nudgeCount: u.nudges.length })) });
}

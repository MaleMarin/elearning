/**
 * Cron semanal: lecciones con más de 6 meses sin actualizar.
 * GET con Authorization: Bearer CRON_SECRET si está definido.
 */
import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as contentFreshness from "@/lib/services/contentFreshness";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ ok: true, stale: [] });
  if (!useFirebase()) return NextResponse.json({ ok: true, stale: [] });
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const stale = await contentFreshness.getAllStaleLessons();
    return NextResponse.json({ ok: true, stale });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 500 });
  }
}

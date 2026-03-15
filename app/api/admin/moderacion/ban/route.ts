/**
 * POST /api/admin/moderacion/ban — Banear usuario temporalmente. Solo admin.
 * Body: { userId, reason, bannedUntil (ISO string, ej. +7 días) }
 */
import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as modStore from "@/lib/services/moderacion-store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ ok: true });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 404 });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    const body = await req.json().catch(() => ({}));
    const userId = (body.userId as string)?.trim();
    const reason = (body.reason as string)?.trim() ?? "Moderación";
    let bannedUntil = new Date();
    if (body.bannedUntil) {
      const parsed = new Date(body.bannedUntil as string);
      if (!Number.isNaN(parsed.getTime())) bannedUntil = parsed;
      else bannedUntil.setDate(bannedUntil.getDate() + 7);
    } else {
      bannedUntil.setDate(bannedUntil.getDate() + 7);
    }
    if (!userId) return NextResponse.json({ error: "Falta userId" }, { status: 400 });
    await modStore.banUser(userId, reason, bannedUntil, auth.uid);
    return NextResponse.json({ ok: true, bannedUntil: bannedUntil.toISOString() });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

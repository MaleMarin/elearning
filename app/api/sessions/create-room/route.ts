/**
 * POST: crear sala de video Daily.co para sesión en vivo.
 * Body: { sessionId, expiresIn? } (expiresIn en segundos, default 3600).
 * Requiere DAILY_API_KEY en .env (daily.co, gratis hasta 1,000 min/mes).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (getDemoMode()) {
    return NextResponse.json({ url: "https://example.daily.co/demo-room" });
  }
  const apiKey = process.env.DAILY_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "DAILY_API_KEY no configurado" }, { status: 503 });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin" && auth.role !== "mentor") return NextResponse.json({ error: "Solo admin o mentor" }, { status: 403 });
    const body = await req.json().catch(() => ({}));
    const sessionId = (body.sessionId as string)?.trim();
    const expiresIn = Math.min(Math.max(Number(body.expiresIn) || 3600, 300), 86400);
    if (!sessionId) return NextResponse.json({ error: "Falta sessionId" }, { status: 400 });

    const res = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        name: `session-${sessionId}`,
        properties: {
          exp: Math.floor(Date.now() / 1000) + expiresIn,
          enable_recording: "cloud",
          max_participants: 100,
        },
      }),
    });
    const room = await res.json();
    if (!res.ok) return NextResponse.json({ error: room.error ?? "Error al crear sala" }, { status: res.status });
    const url = room.url as string;
    const db = getFirebaseAdminFirestore();
    await db.collection("sessions").doc(sessionId).set({ roomUrl: url, createdAt: new Date().toISOString() }, { merge: true });
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

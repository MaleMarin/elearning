/**
 * GET: mensajes del par. POST: enviar mensaje.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as learningPairs from "@/lib/services/learningPairs";
import * as profileService from "@/lib/services/profile";

export const dynamic = "force-dynamic";

async function getDisplayName(uid: string): Promise<string> {
  const profile = await profileService.getProfile(uid);
  if (profile?.fullName?.trim()) return profile.fullName.trim();
  return "Alumno";
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ pairId: string }> }
) {
  const { pairId } = await params;
  if (!pairId) return NextResponse.json({ error: "Falta pairId" }, { status: 400 });
  if (getDemoMode()) return NextResponse.json({ messages: [] });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    const pair = await learningPairs.getPair(pairId, auth.uid);
    if (!pair) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    const messages = await learningPairs.listMessages(pairId);
    const withNames = await Promise.all(
      messages.map(async (m) => ({ ...m, userName: await getDisplayName(m.userId) }))
    );
    return NextResponse.json({ messages: withNames });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ pairId: string }> }
) {
  const { pairId } = await params;
  if (!pairId) return NextResponse.json({ error: "Falta pairId" }, { status: 400 });
  if (getDemoMode()) return NextResponse.json({ id: "demo-msg", userId: "", text: "", createdAt: new Date().toISOString() });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    const body = await req.json();
    const text = (body.text as string) ?? "";
    const msg = await learningPairs.addMessage(pairId, auth.uid, text);
    const userName = await getDisplayName(auth.uid);
    return NextResponse.json({ ...msg, userName });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

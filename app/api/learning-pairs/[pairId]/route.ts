/**
 * GET: detalle del par (solo si el usuario es miembro).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as firebaseContent from "@/lib/services/firebase-content";
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
  if (getDemoMode()) return NextResponse.json({ pair: null, partnerName: null, moduleTitle: null });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    const pair = await learningPairs.getPair(pairId, auth.uid);
    if (!pair) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    const partnerId = pair.userA === auth.uid ? pair.userB : pair.userA;
    const [partnerName, moduleDoc] = await Promise.all([
      getDisplayName(partnerId),
      firebaseContent.getModule(pair.moduleId).catch(() => null),
    ]);
    const moduleTitle = (moduleDoc?.title as string) ?? "Módulo";
    return NextResponse.json({ pair, partnerName, moduleTitle });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

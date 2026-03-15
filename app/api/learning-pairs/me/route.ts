/**
 * GET: par activo del usuario, con nombre del compañero y título del módulo.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as learningPairs from "@/lib/services/learningPairs";
import * as profileService from "@/lib/services/profile";

export const dynamic = "force-dynamic";

async function displayName(uid: string): Promise<string> {
  const p = await profileService.getProfile(uid);
  if (p?.fullName?.trim()) return p.fullName.trim();
  return "Alumno";
}

export async function GET(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ pair: null, partnerName: null, moduleTitle: null });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    const pair = await learningPairs.getActivePairForUser(auth.uid);
    if (!pair) return NextResponse.json({ pair: null, partnerName: null, moduleTitle: null });
    const partnerId = pair.userA === auth.uid ? pair.userB : pair.userA;
    const partnerName = await displayName(partnerId);
    const mod = await firebaseContent.getModule(pair.moduleId).catch(() => null);
    const moduleTitle = (mod?.title as string) ?? "Módulo";
    return NextResponse.json({ pair: { ...pair, partnerId, partnerName }, partnerName, moduleTitle });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

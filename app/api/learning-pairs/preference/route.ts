/**
 * GET: preferencia de "buscar colega".
 * POST: activar/desactivar (body: { lookingForPartner: boolean }).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as learningPairs from "@/lib/services/learningPairs";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (getDemoMode()) {
    return NextResponse.json({ preference: { lookingForPartner: false, cohortId: null, updatedAt: null }, pair: null });
  }
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    const enrollment = await firebaseContent.getActiveEnrollmentForUser(auth.uid);
    const preference = await learningPairs.getPreference(auth.uid);
    if (!enrollment) {
      return NextResponse.json({
        preference: preference ? { ...preference } : { lookingForPartner: false, cohortId: null, updatedAt: null },
        pair: null,
      });
    }
    const pair = await learningPairs.getActivePairForUser(auth.uid);
    return NextResponse.json({
      preference: preference ?? { lookingForPartner: false, cohortId: enrollment.cohort_id, updatedAt: null },
      pair,
    });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ ok: true, pair: null });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    const enrollment = await firebaseContent.getActiveEnrollmentForUser(auth.uid);
    if (!enrollment) return NextResponse.json({ error: "Sin cohorte activa" }, { status: 403 });
    const body = await req.json();
    const lookingForPartner = body.lookingForPartner === true;
    await learningPairs.setLookingForPartner(auth.uid, enrollment.cohort_id, lookingForPartner);
    const pair = await learningPairs.getActivePairForUser(auth.uid);
    return NextResponse.json({ ok: true, pair });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}

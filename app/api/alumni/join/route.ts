/**
 * POST: unirse al directorio de egresados (tras certificado).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as alumni from "@/lib/services/alumni";
import * as profileService from "@/lib/services/profile";
import * as firebaseContent from "@/lib/services/firebase-content";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ ok: true });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    const profile = await profileService.getProfile(auth.uid);
    const enrollment = await firebaseContent.getActiveEnrollmentForUser(auth.uid);
    const body = await req.json().catch(() => ({}));
    const cohortName = (body.cohortName as string) ?? (enrollment ? (await firebaseContent.getCohort(enrollment.cohort_id).catch(() => null))?.name as string : null) ?? null;
    await alumni.joinDirectory(auth.uid, {
      fullName: (body.fullName as string)?.trim() || profile?.fullName?.trim() || "Egresado",
      institution: (body.institution as string) ?? profile?.institution ?? null,
      position: (body.position as string) ?? profile?.position ?? null,
      region: (body.region as string) ?? profile?.region ?? null,
      cohortId: (body.cohortId as string) ?? enrollment?.cohort_id ?? null,
      cohortName,
      linkedIn: (body.linkedIn as string) ?? profile?.linkedIn ?? null,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

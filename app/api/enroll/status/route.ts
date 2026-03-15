import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { PRECISAR_SESSION_COOKIE, isDemoCookieValue } from "@/lib/auth/session-cookie";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as firebaseContent from "@/lib/services/firebase-content";

export const dynamic = "force-dynamic";

function demoEnrolledResponse() {
  return NextResponse.json({ enrolled: true, cohortId: "demo-cohort-id", cohortName: "Cohorte demo" });
}

/**
 * GET /api/enroll/status
 * Devuelve { enrolled: boolean, cohortId?: string } para el usuario autenticado.
 */
export async function GET(req: NextRequest) {
  if (getDemoMode()) return demoEnrolledResponse();

  const cookieValue = req.cookies.get(PRECISAR_SESSION_COOKIE)?.value;
  if (cookieValue && isDemoCookieValue(cookieValue)) return demoEnrolledResponse();

  if (!useFirebase()) {
    return NextResponse.json({ enrolled: false }, { status: 200 });
  }

  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role === "admin") {
      return NextResponse.json({ enrolled: true });
    }
    const enrollment = await firebaseContent.getActiveEnrollmentForUser(auth.uid);
    if (enrollment) {
      let cohortName: string | null = null;
      try {
        const cohort = await firebaseContent.getCohort(enrollment.cohort_id);
        cohortName = (cohort.nombre as string) ?? (cohort.name as string) ?? null;
      } catch {
        // ignore
      }
      return NextResponse.json({ enrolled: true, cohortId: enrollment.cohort_id, cohortName });
    }
    return NextResponse.json({ enrolled: false }, { status: 200 });
  } catch {
    return NextResponse.json({ enrolled: false }, { status: 200 });
  }
}

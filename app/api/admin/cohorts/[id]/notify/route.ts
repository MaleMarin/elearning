import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as firebaseContent from "@/lib/services/firebase-content";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

/** POST: enviar notificación a toda la cohorte. Body: { title, body }. */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (getDemoMode()) {
    return NextResponse.json({ ok: true, notified: 2 });
  }
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 404 });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin" && auth.role !== "mentor") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    const { id: cohortId } = await params;
    const cohort = await firebaseContent.getCohort(cohortId);
    const alumnos = (cohort.alumnos as string[]) ?? [];
    if (alumnos.length === 0) {
      return NextResponse.json({ ok: true, notified: 0 });
    }
    const body = await req.json().catch(() => ({}));
    const title = typeof body.title === "string" ? body.title.trim() : "Notificación de tu cohorte";
    const bodyText = typeof body.body === "string" ? body.body.trim() : "";
    const db = getFirebaseAdminFirestore();
    const batch = db.batch();
    const ref = db.collection("notifications");
    for (const uid of alumnos) {
      const docRef = ref.doc();
      batch.set(docRef, {
        user_id: uid,
        type: "cohort_broadcast",
        title,
        body: bodyText,
        cohort_id: cohortId,
        created_at: new Date(),
        read: false,
      });
    }
    await batch.commit();
    return NextResponse.json({ ok: true, notified: alumnos.length });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

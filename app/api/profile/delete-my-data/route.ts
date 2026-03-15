/**
 * POST /api/profile/delete-my-data — borra todos los datos sensibles del usuario (Brecha 1).
 * Elimina: journal, futureLetter, diagnostic, closingSurvey.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    const db = getFirebaseAdminFirestore();
    const uid = auth.uid;

    const batch = db.batch();

    const journalSnap = await db.collection("users").doc(uid).collection("journal").get();
    journalSnap.docs.forEach((d) => batch.delete(d.ref));

    const letterRef = db.collection("users").doc(uid).collection("futureLetter").doc("letter");
    batch.delete(letterRef);

    const diagnosticRef = db.collection("users").doc(uid).collection("diagnostic").doc("v1");
    batch.delete(diagnosticRef);

    const surveyRef = db.collection("users").doc(uid).collection("closingSurvey").doc("v1");
    batch.delete(surveyRef);

    await batch.commit();

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

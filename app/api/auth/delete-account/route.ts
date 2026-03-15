/**
 * DELETE /api/auth/delete-account
 * Elimina todos los datos del usuario y la cuenta (derecho al olvido — LFPDPPP Art. 22).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getFirebaseAdminAuth, getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

const USER_SUBCOLLECTIONS = [
  "portfolio",
  "journal",
  "progress",
  "checkins",
  "notas",
  "futureLetter",
  "audit_logs",
  "question_votes",
  "glossary_votes",
  "spaced_repetition",
  "quiz_attempts",
  "lesson_checklist",
  "roleplay_sessions",
  "resource_views",
  "cognitive_checkins",
  "portafolio_entradas",
];

const BATCH_LIMIT = 500;

export async function DELETE(req: NextRequest) {
  let user: { uid: string };
  try {
    user = await getAuthFromRequest(req);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const uid = user.uid;
  const db = getFirebaseAdminFirestore();
  const auth = getFirebaseAdminAuth();

  try {
    for (const col of USER_SUBCOLLECTIONS) {
      let snap = await db.collection("users").doc(uid).collection(col).limit(BATCH_LIMIT).get();
      while (!snap.empty) {
        const batch = db.batch();
        snap.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        snap = await db.collection("users").doc(uid).collection(col).limit(BATCH_LIMIT).get();
      }
    }

    const finalBatch = db.batch();
    finalBatch.delete(db.collection("users").doc(uid));
    finalBatch.delete(db.collection("profiles").doc(uid));
    await finalBatch.commit();

    await auth.deleteUser(uid);

    await db.collection("audit_logs").add({
      action: "account_deleted",
      userId: uid,
      timestamp: new Date(),
      initiatedBy: "user",
    });
  } catch (err) {
    console.error("Error eliminando cuenta:", err);
    return NextResponse.json(
      { error: "Error al eliminar la cuenta." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Cuenta eliminada correctamente.",
  });
}

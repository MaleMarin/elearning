/**
 * GET /api/profile/export — exporta datos sensibles del usuario (cifrados en Firestore).
 * El cliente descifra con su uid y genera el JSON para descarga (Brecha 1).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    const db = getFirebaseAdminFirestore();
    const uid = auth.uid;

    const [journalSnap, letterSnap, diagnosticDoc, surveyDoc] = await Promise.all([
      db.collection("users").doc(uid).collection("journal").get(),
      db.collection("users").doc(uid).collection("futureLetter").doc("letter").get(),
      db.collection("users").doc(uid).collection("diagnostic").doc("v1").get(),
      db.collection("users").doc(uid).collection("closingSurvey").doc("v1").get(),
    ]);

    const journal: Record<string, { content: string; reflection: string; updatedAt: string | null }> = {};
    journalSnap.docs.forEach((d) => {
      const data = d.data();
      journal[d.id] = {
        content: (data.content as string) ?? "",
        reflection: (data.reflection as string) ?? "",
        updatedAt: (data.updatedAt as { toDate?: () => Date })?.toDate?.()?.toISOString() ?? null,
      };
    });

    const letterData = letterSnap.data();
    const futureLetter = {
      content: (letterData?.content as string) ?? "",
      writtenAt: (letterData?.writtenAt as { toDate?: () => Date })?.toDate?.()?.toISOString() ?? null,
    };

    const diagData = diagnosticDoc.data();
    const diagnostic = {
      encryptedAnswers: (diagData?.encryptedAnswers as string) ?? "",
      completedAt: diagData?.completedAt ?? null,
      skipped: !!diagData?.skipped,
    };

    const surveyData = surveyDoc.data();
    const closingSurvey = {
      encryptedPayload: (surveyData?.encryptedPayload as string) ?? "",
      completedAt: surveyData?.completedAt ?? null,
    };

    return NextResponse.json({
      journal,
      futureLetter,
      diagnostic,
      closingSurvey,
      exportedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

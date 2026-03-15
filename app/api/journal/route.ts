import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

/** GET /api/journal?lessonId=... — devuelve la entrada del diario para la lección. */
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    const lessonId = req.nextUrl.searchParams.get("lessonId");
    if (!lessonId?.trim()) {
      return NextResponse.json({ error: "Falta lessonId" }, { status: 400 });
    }
    const db = getFirebaseAdminFirestore();
    const ref = db.collection("users").doc(auth.uid).collection("journal").doc(lessonId);
    const snap = await ref.get();
    const data = snap.data();
    return NextResponse.json({
      content: (data?.content as string) ?? "",
      reflection: (data?.reflection as string) ?? "",
      updatedAt: (data?.updatedAt as { toMillis?: () => number })?.toMillis?.() ?? null,
    });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

/** POST /api/journal — guarda entrada del diario (body: { lessonId, content }). */
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    const body = await req.json();
    const lessonId = body?.lessonId?.trim();
    const content = typeof body?.content === "string" ? body.content : "";
    const reflection = typeof body?.reflection === "string" ? body.reflection : "";
    if (!lessonId) {
      return NextResponse.json({ error: "Falta lessonId" }, { status: 400 });
    }
    const db = getFirebaseAdminFirestore();
    const ref = db.collection("users").doc(auth.uid).collection("journal").doc(lessonId);
    await ref.set(
      {
        content,
        reflection,
        lessonId,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

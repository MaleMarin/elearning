import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

/** GET /api/onboarding/future-letter — devuelve la carta (contenido cifrado E2E y fecha). */
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    const db = getFirebaseAdminFirestore();
    const ref = db.collection("users").doc(auth.uid).collection("futureLetter").doc("letter");
    const snap = await ref.get();
    const data = snap.data();
    const writtenAt = data?.writtenAt as { toDate?: () => Date } | undefined;
    return NextResponse.json({
      content: (data?.content as string) ?? "",
      writtenAt: writtenAt?.toDate?.()?.toISOString() ?? null,
    });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

/** POST /api/onboarding/future-letter — guarda la carta al yo futuro. Body: { content: string } (cifrado en cliente). */
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    const body = await req.json();
    const content = typeof body?.content === "string" ? body.content.trim() : "";
    const db = getFirebaseAdminFirestore();
    const ref = db.collection("users").doc(auth.uid).collection("futureLetter").doc("letter");
    await ref.set(
      {
        content,
        writtenAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

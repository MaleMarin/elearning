import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

/** GET /api/wellness/checkin?date=YYYY-MM-DD — indica si ya hizo check-in ese día. */
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    const date = req.nextUrl.searchParams.get("date");
    if (!date?.trim()) {
      return NextResponse.json({ error: "Falta date" }, { status: 400 });
    }
    const db = getFirebaseAdminFirestore();
    const snap = await db.collection("users").doc(auth.uid).collection("checkins").doc(date).get();
    return NextResponse.json({ done: snap.exists });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

/** POST /api/wellness/checkin — guarda check-in del día. Body: { date: string, mood: string }. */
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    const body = await req.json();
    const date = body?.date?.trim();
    const mood = body?.mood?.trim();
    if (!date || !mood) {
      return NextResponse.json({ error: "Faltan date o mood" }, { status: 400 });
    }
    const db = getFirebaseAdminFirestore();
    await db.collection("users").doc(auth.uid).collection("checkins").doc(date).set({
      mood,
      date,
      createdAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

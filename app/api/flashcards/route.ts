import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

/** GET ?lessonId=... — devuelve las flashcards guardadas del alumno para esa lección. */
export async function GET(req: NextRequest) {
  let user: { uid: string };
  try {
    user = await getAuthFromRequest(req);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const lessonId = req.nextUrl.searchParams.get("lessonId") ?? "";
  if (!lessonId) {
    return NextResponse.json({ flashcards: [] });
  }

  const db = getFirebaseAdminFirestore();
  if (!db) return NextResponse.json({ flashcards: [] });

  const doc = await db
    .collection("users")
    .doc(user.uid)
    .collection("flashcards")
    .doc(lessonId)
    .get();

  const data = doc.data();
  const flashcards = Array.isArray(data?.flashcards) ? data.flashcards : [];
  return NextResponse.json({ flashcards });
}

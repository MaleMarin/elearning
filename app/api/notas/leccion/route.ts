import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let user: { uid: string };
  try {
    user = await getAuthFromRequest(req);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const lessonId = req.nextUrl.searchParams.get("lessonId") ?? "";
  const db = getFirebaseAdminFirestore();
  if (!db) return NextResponse.json({ notes: [] });

  const snap = await db
    .collection("users")
    .doc(user.uid)
    .collection("notas_lecciones")
    .where("lessonId", "==", lessonId)
    .orderBy("timestamp", "asc")
    .get();

  const notes = snap.docs.map((d) => {
    const data = d.data();
    const ts = data.timestamp?.toDate?.() ?? data.timestamp;
    return {
      id: d.id,
      text: data.text ?? "",
      blockIndex: data.blockIndex ?? 0,
      timestamp: ts instanceof Date ? ts : new Date(),
    };
  });

  return NextResponse.json({ notes });
}

export async function POST(req: NextRequest) {
  let user: { uid: string };
  try {
    user = await getAuthFromRequest(req);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const lessonId = (body.lessonId as string) ?? "";
  const text = (body.text as string) ?? "";

  const db = getFirebaseAdminFirestore();
  if (!db) {
    return NextResponse.json(
      { note: { id: "", lessonId, text, timestamp: new Date() } }
    );
  }

  const ref = await db
    .collection("users")
    .doc(user.uid)
    .collection("notas_lecciones")
    .add({ lessonId, text, blockIndex: 0, timestamp: new Date() });

  return NextResponse.json({
    note: { id: ref.id, lessonId, text, timestamp: new Date() },
  });
}

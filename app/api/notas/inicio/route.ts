import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

/** GET: devuelve la nota del dashboard del usuario (users/{uid}/notas/inicio). Solo el alumno la ve. */
export async function GET(req: NextRequest) {
  let user: { uid: string };
  try {
    user = await getAuthFromRequest(req);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const db = getFirebaseAdminFirestore();
  if (!db) return NextResponse.json({ text: "" });

  const doc = await db
    .collection("users")
    .doc(user.uid)
    .collection("notas")
    .doc("inicio")
    .get();

  const text = (doc.data()?.text as string) ?? "";
  return NextResponse.json({ text });
}

/** POST: guarda la nota del dashboard en users/{uid}/notas/inicio. Completamente privado. */
export async function POST(req: NextRequest) {
  let user: { uid: string };
  try {
    user = await getAuthFromRequest(req);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const text = (body.text as string) ?? "";

  const db = getFirebaseAdminFirestore();
  if (!db) {
    return NextResponse.json({ ok: true });
  }

  await db
    .collection("users")
    .doc(user.uid)
    .collection("notas")
    .doc("inicio")
    .set({ text, updatedAt: new Date() }, { merge: true });

  return NextResponse.json({ ok: true });
}

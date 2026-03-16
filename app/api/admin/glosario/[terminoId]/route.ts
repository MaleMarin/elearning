import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

const COLLECTION = "course_glossary";

/** DELETE → eliminar término */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ terminoId: string }> }
) {
  if (getDemoMode()) return NextResponse.json({ ok: true });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 404 });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin" && auth.role !== "mentor") {
      return NextResponse.json({ error: "Solo administradores o mentores" }, { status: 403 });
    }
    const { terminoId } = await params;
    if (!terminoId) return NextResponse.json({ error: "terminoId requerido" }, { status: 400 });

    const db = getFirebaseAdminFirestore();
    await db.collection(COLLECTION).doc(terminoId).delete();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

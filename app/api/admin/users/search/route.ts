import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

/** GET ?q=maria — busca en profiles por full_name o email (mín 2 caracteres). Solo admin. */
export async function GET(req: NextRequest) {
  if (getDemoMode()) {
    return NextResponse.json({
      users: [
        { id: "u1", full_name: "María González", email: "maria@ejemplo.gob.mx" },
        { id: "u2", full_name: "Carlos Ruiz", email: "carlos@ejemplo.gob.mx" },
      ],
    });
  }
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    const q = (req.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase();
    if (q.length < 2) return NextResponse.json({ users: [] });
    const db = getFirebaseAdminFirestore();
    const snap = await db.collection("profiles").limit(20).get();
    const matches: { id: string; full_name: string; email: string | null }[] = [];
    for (const doc of snap.docs) {
      const d = doc.data();
      const name = ((d.full_name as string) ?? "").toLowerCase();
      const email = ((d.email as string) ?? "").toLowerCase();
      if (name.includes(q) || email.includes(q)) {
        matches.push({
          id: doc.id,
          full_name: (d.full_name as string)?.trim() || "Sin nombre",
          email: (d.email as string) ?? null,
        });
      }
    }
    return NextResponse.json({ users: matches });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

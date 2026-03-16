import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

const COLLECTION = "course_glossary";

/** GET ?cursoId=xxx → lista términos del curso */
export async function GET(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ terminos: [] });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 404 });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin" && auth.role !== "mentor") {
      return NextResponse.json({ error: "Solo administradores o mentores" }, { status: 403 });
    }
    const cursoId = req.nextUrl.searchParams.get("cursoId");
    if (!cursoId) return NextResponse.json({ error: "cursoId requerido" }, { status: 400 });

    const db = getFirebaseAdminFirestore();
    const snap = await db.collection(COLLECTION).where("courseId", "==", cursoId).get();

    const terminos = snap.docs
      .map((d) => {
        const data = d.data();
        return {
          id: d.id,
          termino: data.termino ?? "",
          definicion: data.definicion ?? "",
          courseId: data.courseId,
        };
      })
      .sort((a, b) => a.termino.localeCompare(b.termino, "es"));
    return NextResponse.json({ terminos });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

/** POST → crear término { cursoId, termino, definicion } */
export async function POST(req: NextRequest) {
  if (getDemoMode()) {
    const body = await req.json().catch(() => ({}));
    return NextResponse.json({
      termino: {
        id: "demo-term",
        termino: (body.termino as string) || "Término demo",
        definicion: (body.definicion as string) || "",
        courseId: body.cursoId,
      },
    });
  }
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 404 });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin" && auth.role !== "mentor") {
      return NextResponse.json({ error: "Solo administradores o mentores" }, { status: 403 });
    }
    const body = await req.json().catch(() => ({}));
    const cursoId = typeof body.cursoId === "string" ? body.cursoId.trim() : "";
    const termino = typeof body.termino === "string" ? body.termino.trim() : "";
    const definicion = typeof body.definicion === "string" ? body.definicion.trim() : "";
    if (!cursoId || !termino) return NextResponse.json({ error: "cursoId y termino requeridos" }, { status: 400 });

    const db = getFirebaseAdminFirestore();
    const ref = await db.collection(COLLECTION).add({
      courseId: cursoId,
      termino,
      definicion,
      createdAt: new Date(),
    });
    const created = {
      id: ref.id,
      termino,
      definicion,
      courseId: cursoId,
    };
    return NextResponse.json({ termino: created });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

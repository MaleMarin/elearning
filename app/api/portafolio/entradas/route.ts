/**
 * GET: todas las entradas del alumno (por módulo).
 * POST: crear o actualizar entrada en users/{uid}/portafolio_entradas/{moduloId}
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

const COLL = "portafolio_entradas";

export const dynamic = "force-dynamic";

export type EntradaPayload = {
  moduloId: string;
  moduloTitulo: string;
  aprendizaje: string;
  reflexion: string;
  aplicacion: string;
  mood: string;
};

function parseBody(body: unknown): EntradaPayload | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const moduloId = typeof b.moduloId === "string" ? b.moduloId.trim() : "";
  const moduloTitulo = typeof b.moduloTitulo === "string" ? b.moduloTitulo.trim() : "";
  const aprendizaje = typeof b.aprendizaje === "string" ? b.aprendizaje.trim().slice(0, 120) : "";
  const reflexion = typeof b.reflexion === "string" ? b.reflexion.trim().slice(0, 500) : "";
  const aplicacion = typeof b.aplicacion === "string" ? b.aplicacion.trim().slice(0, 500) : "";
  const mood = typeof b.mood === "string" ? b.mood.trim() : "";
  if (!moduloId) return null;
  return { moduloId, moduloTitulo, aprendizaje, reflexion, aplicacion, mood };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    const uid = auth.uid;
    const db = getFirebaseAdminFirestore();
    const snap = await db.collection("users").doc(uid).collection(COLL).get();
    const entradas = snap.docs
      .map((d) => {
        const data = d.data();
        const updatedAt = data.updatedAt?.toDate?.() ?? data.updatedAt;
        return {
          moduloId: d.id,
          moduloTitulo: String(data.moduloTitulo ?? ""),
          aprendizaje: String(data.aprendizaje ?? ""),
          reflexion: String(data.reflexion ?? ""),
          aplicacion: String(data.aplicacion ?? ""),
          mood: String(data.mood ?? ""),
          updatedAt: updatedAt ? new Date(updatedAt).toISOString() : new Date().toISOString(),
        };
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return NextResponse.json({ entradas });
  } catch (e) {
    if (String(e).includes("No autorizado")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.json({ error: "Error al listar entradas" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const input = parseBody(body);
    if (!input) {
      return NextResponse.json({ error: "Falta moduloId" }, { status: 400 });
    }
    const db = getFirebaseAdminFirestore();
    const ref = db.collection("users").doc(auth.uid).collection(COLL).doc(input.moduloId);
    const now = new Date();
    await ref.set({
      moduloId: input.moduloId,
      moduloTitulo: input.moduloTitulo,
      aprendizaje: input.aprendizaje,
      reflexion: input.reflexion,
      aplicacion: input.aplicacion,
      mood: input.mood,
      updatedAt: now,
    });
    return NextResponse.json({
      ok: true,
      entrada: {
        moduloId: input.moduloId,
        moduloTitulo: input.moduloTitulo,
        aprendizaje: input.aprendizaje,
        reflexion: input.reflexion,
        aplicacion: input.aplicacion,
        mood: input.mood,
        updatedAt: now.toISOString(),
      },
    });
  } catch (e) {
    if (String(e).includes("No autorizado")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.json({ error: "Error al guardar entrada" }, { status: 500 });
  }
}

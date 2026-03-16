/**
 * GET: lista nodos. POST: crear/editar nodo. DELETE: eliminar nodo (Brecha 6).
 * Query: institutionId (requerido). DELETE/POST body: institutionId, conceptId (DELETE), concepto, modulo, relacionados (POST).
 */
import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import * as knowledge from "@/lib/services/knowledge-graph";

export const dynamic = "force-dynamic";

function slug(concepto: string): string {
  return concepto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "concepto";
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    const institutionId = req.nextUrl.searchParams.get("institutionId")?.trim() || "default";
    const nodes = await knowledge.getKnowledgeGraph(institutionId);
    const totalEmpleados = nodes.length > 0 ? Math.max(...nodes.map((n) => n.usuariosQueLoDominan), 1) : 0;
    return NextResponse.json({ nodes, institutionId, totalEmpleados });
  } catch (e) {
    return NextResponse.json({ error: "Error al cargar grafo" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    const body = await req.json().catch(() => ({}));
    const institutionId = (body.institutionId as string)?.trim() || "default";
    const concepto = (body.concepto as string)?.trim() || "";
    const modulo = (body.modulo as string)?.trim() || "";
    const relacionados = Array.isArray(body.relacionados) ? (body.relacionados as string[]) : [];
    if (!concepto) return NextResponse.json({ error: "concepto requerido" }, { status: 400 });
    const conceptId = (body.conceptId as string)?.trim() || slug(concepto);
    const db = getFirebaseAdminFirestore();
    const ref = db.collection("institutions").doc(institutionId).collection("knowledgeGraph").doc(conceptId);
    const now = Timestamp.now();
    await ref.set({
      concepto,
      modulo,
      relacionados,
      usuariosQueLoDominan: 0,
      nivelPromedio: 50,
      ultimaActualizacion: now,
    }, { merge: true });
    const snap = await ref.get();
    const d = snap.data()!;
    return NextResponse.json({
      id: snap.id,
      concepto: d.concepto,
      modulo: d.modulo,
      relacionados: d.relacionados ?? [],
      usuariosQueLoDominan: d.usuariosQueLoDominan ?? 0,
      nivelPromedio: d.nivelPromedio ?? 50,
      ultimaActualizacion: d.ultimaActualizacion?.toDate?.()?.toISOString?.() ?? "",
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    const institutionId = req.nextUrl.searchParams.get("institutionId")?.trim() || "default";
    const conceptId = req.nextUrl.searchParams.get("conceptId")?.trim();
    if (!conceptId) return NextResponse.json({ error: "conceptId requerido" }, { status: 400 });
    const db = getFirebaseAdminFirestore();
    const ref = db.collection("institutions").doc(institutionId).collection("knowledgeGraph").doc(conceptId);
    await ref.delete();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 500 });
  }
}

/**
 * GET: lista insights del módulo.
 * POST: crea insight (body: text, institution?).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as insights from "@/lib/services/insights";

export const dynamic = "force-dynamic";

async function getDisplayName(uid: string): Promise<string> {
  try {
    const db = getFirebaseAdminFirestore();
    const snap = await db.collection("profiles").doc(uid).get();
    const name = (snap.data()?.full_name as string)?.trim();
    if (name) return name;
  } catch {
    // ignore
  }
  return "Alumno";
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  const { moduleId } = await params;
  if (!moduleId) return NextResponse.json({ error: "Falta moduleId" }, { status: 400 });
  if (getDemoMode()) {
    return NextResponse.json({
      items: [
        { id: "i1", userName: "Ana P.", text: "En mi institución hacemos el seguimiento con planillas compartidas.", institution: "Municipalidad X", likes: 3, loves: 1, isHighlighted: true },
      ],
    });
  }
  if (!useFirebase()) return NextResponse.json({ items: [] });
  try {
    const items = await insights.listInsights(moduleId);
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  const { moduleId } = await params;
  if (!moduleId) return NextResponse.json({ error: "Falta moduleId" }, { status: 400 });
  if (getDemoMode()) return NextResponse.json({ id: "demo-i", userName: "Tú", text: "Insight demo", institution: null, likes: 0, loves: 0, isHighlighted: false });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    const enrollment = await firebaseContent.getActiveEnrollmentForUser(auth.uid);
    if (!enrollment) return NextResponse.json({ error: "Sin grupo activo" }, { status: 403 });
    const body = await req.json();
    const text = (body.text as string)?.trim();
    if (!text) return NextResponse.json({ error: "Falta text" }, { status: 400 });
    const userName = await getDisplayName(auth.uid);
    const item = await insights.createInsight(moduleId, auth.uid, userName, text, body.institution);
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

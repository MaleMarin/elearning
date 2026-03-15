/**
 * GET: mensajes del equipo. POST: enviar mensaje (Brecha 8).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { useFirebase } from "@/lib/env";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as challenges from "@/lib/services/cohort-challenges";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

async function getDisplayName(uid: string): Promise<string> {
  const snap = await getFirebaseAdminFirestore().collection("profiles").doc(uid).get();
  return (snap.data()?.full_name as string)?.trim() || "Usuario";
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ challengeId: string; teamId: string }> }
) {
  try {
    const auth = await getAuthFromRequest(_req);
    const { challengeId, teamId } = await params;
    if (!challengeId || !teamId) return NextResponse.json({ error: "challengeId y teamId requeridos" }, { status: 400 });
    if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
    const enrollment = await firebaseContent.getActiveEnrollmentForUser(auth.uid);
    if (!enrollment) return NextResponse.json({ error: "No perteneces a un grupo" }, { status: 403 });
    const team = await challenges.getTeam(enrollment.cohort_id, challengeId, teamId);
    if (!team) return NextResponse.json({ error: "Equipo no encontrado" }, { status: 404 });
    if (!team.miembros.includes(auth.uid)) return NextResponse.json({ error: "No eres miembro del equipo" }, { status: 403 });
    const messages = await challenges.getTeamMessages(enrollment.cohort_id, challengeId, teamId);
    return NextResponse.json({ messages });
  } catch (e) {
    return NextResponse.json({ error: "Error al listar mensajes" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ challengeId: string; teamId: string }> }
) {
  try {
    const auth = await getAuthFromRequest(req);
    const { challengeId, teamId } = await params;
    if (!challengeId || !teamId) return NextResponse.json({ error: "challengeId y teamId requeridos" }, { status: 400 });
    if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
    const enrollment = await firebaseContent.getActiveEnrollmentForUser(auth.uid);
    if (!enrollment) return NextResponse.json({ error: "No perteneces a un grupo" }, { status: 403 });
    const team = await challenges.getTeam(enrollment.cohort_id, challengeId, teamId);
    if (!team) return NextResponse.json({ error: "Equipo no encontrado" }, { status: 404 });
    if (!team.miembros.includes(auth.uid)) return NextResponse.json({ error: "No eres miembro del equipo" }, { status: 403 });
    const body = await req.json().catch(() => ({}));
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (!text) return NextResponse.json({ error: "Texto requerido" }, { status: 400 });
    const userName = await getDisplayName(auth.uid);
    const message = await challenges.addTeamMessage(enrollment.cohort_id, challengeId, teamId, auth.uid, userName, text);
    return NextResponse.json({ message });
  } catch (e) {
    return NextResponse.json({ error: "Error al enviar mensaje" }, { status: 500 });
  }
}

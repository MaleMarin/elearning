/**
 * GET: listar solicitudes de mentoría (solo admin).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import * as mentors from "@/lib/services/mentors";

export const dynamic = "force-dynamic";

async function displayName(uid: string): Promise<string> {
  try {
    const db = getFirebaseAdminFirestore();
    const snap = await db.collection("profiles").doc(uid).get();
    return (snap.data()?.full_name as string)?.trim() ?? "Usuario";
  } catch {
    return "Usuario";
  }
}

export async function GET(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ requests: [] });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo admin" }, { status: 403 });
    const list = await mentors.listRequestsForAdmin();
    const withNames = await Promise.all(
      list.map(async (r) => {
        const mentor = await mentors.getMentor(r.mentorId);
        return {
          ...r,
          studentName: await displayName(r.studentId),
          mentorName: mentor?.fullName ?? await displayName(r.mentorId),
        };
      })
    );
    return NextResponse.json({ requests: withNames });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

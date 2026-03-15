/**
 * POST: solicitar 1 sesión de 30 min con un mentor.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as mentors from "@/lib/services/mentors";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ id: "demo-req", status: "pending" });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    const body = await req.json();
    const mentorId = body.mentorId as string;
    if (!mentorId) return NextResponse.json({ error: "Falta mentorId" }, { status: 400 });
    const message = (body.message as string) ?? null;
    const request = await mentors.createRequest(auth.uid, mentorId, message);
    return NextResponse.json(request);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

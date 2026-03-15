/**
 * POST: registrarse como mentor voluntario (tras certificado).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as mentors from "@/lib/services/mentors";
import * as profileService from "@/lib/services/profile";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ ok: true });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    const body = await req.json();
    const profile = await profileService.getProfile(auth.uid);
    const fullName = (body.fullName as string)?.trim() || profile?.fullName?.trim() || "Mentor";
    const mentor = await mentors.registerMentor(auth.uid, {
      fullName,
      institution: body.institution ?? profile?.institution ?? null,
      position: body.position ?? profile?.position ?? null,
      photoURL: body.photoURL ?? profile?.photoURL ?? null,
      whatsapp: body.whatsapp ?? null,
      cohortName: body.cohortName ?? null,
    });
    return NextResponse.json(mentor);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

/**
 * GET: mis solicitudes de mentoría.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as mentors from "@/lib/services/mentors";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ requests: [] });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    const requests = await mentors.getMyRequests(auth.uid);
    return NextResponse.json({ requests });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

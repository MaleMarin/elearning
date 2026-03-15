/**
 * GET: nudges para el usuario actual (in-app banner).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode } from "@/lib/env";
import * as nudges from "@/lib/services/nudges";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    if (getDemoMode()) {
      const list = await nudges.getNudgesForUser("");
      return NextResponse.json({ nudges: list });
    }
    const auth = await getAuthFromRequest(req);
    const list = await nudges.getNudgesForUser(auth.uid);
    return NextResponse.json({ nudges: list });
  } catch {
    return NextResponse.json({ nudges: [] });
  }
}

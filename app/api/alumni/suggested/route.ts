/**
 * GET: egresados sugeridos para el usuario (misma región o perfil similar).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as alumni from "@/lib/services/alumni";
import * as profileService from "@/lib/services/profile";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ suggested: [] });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    const profile = await profileService.getProfile(auth.uid);
    const all = await alumni.listAlumni(undefined, 50);
    const mine = all.filter((a) => a.userId !== auth.uid);
    const myRegion = (profile?.region ?? "").trim().toLowerCase();
    const myPosition = (profile?.position ?? "").trim().toLowerCase();
    const suggested = mine
      .filter((a) => {
        if (myRegion && (a.region ?? "").toLowerCase() === myRegion) return true;
        if (myPosition && (a.position ?? "").toLowerCase().includes(myPosition) || (a.position ?? "").toLowerCase().split(/\s+/).some((w) => myPosition.includes(w))) return true;
        return false;
      })
      .slice(0, 5);
    return NextResponse.json({ suggested: suggested.length ? suggested : mine.slice(0, 3) });
  } catch {
    return NextResponse.json({ suggested: [] });
  }
}

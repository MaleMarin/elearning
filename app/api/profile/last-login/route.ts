import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export interface LastLoginResponse {
  timestamp: string | null;
  device: { browser: string; os: string; isMobile: boolean } | null;
}

/** GET: último acceso (login) desde audit_logs */
export async function GET(req: NextRequest) {
  try {
    if (getDemoMode()) {
      return NextResponse.json({
        timestamp: new Date().toISOString(),
        device: { browser: "Chrome", os: "macOS", isMobile: false },
      });
    }
    const auth = await getAuthFromRequest(req);
    if (!useFirebase()) {
      return NextResponse.json({ timestamp: null, device: null });
    }

    const db = getFirebaseAdminFirestore();
    const snap = await db
      .collection("audit_logs")
      .where("userId", "==", auth.uid)
      .where("action", "==", "login")
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json({ timestamp: null, device: null });
    }

    const d = snap.docs[0].data();
    const ts = d.timestamp;
    const timestamp =
      ts && typeof (ts as { toDate?: () => Date }).toDate === "function"
        ? (ts as { toDate: () => Date }).toDate().toISOString()
        : typeof ts === "string"
          ? ts
          : null;
    const device = d.device as LastLoginResponse["device"] | undefined;

    return NextResponse.json({ timestamp, device: device ?? null });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

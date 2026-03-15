import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as workshop from "@/lib/services/workshop";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workshopId: string }> }
) {
  const { workshopId } = await params;
  if (getDemoMode()) return NextResponse.json({ ok: true });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const content = typeof body.content === "string" ? body.content : "";
    const fileUrl = typeof body.fileUrl === "string" ? body.fileUrl : null;
    await workshop.setSubmission(workshopId, auth.uid, { content, fileUrl });
    const w = await workshop.getWorkshop(workshopId);
    if (w) {
      const submittedIds = await workshop.getSubmissionUserIds(workshopId);
      if (submittedIds.length >= 2) {
        await workshop.assignPeers(workshopId, submittedIds, w.peerCount);
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : 500 });
  }
}

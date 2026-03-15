/**
 * POST: aprobar o rechazar solicitud. Body: { action: "approve" | "reject" }
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as mentors from "@/lib/services/mentors";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });
  if (getDemoMode()) return NextResponse.json({ ok: true });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo admin" }, { status: 403 });
    const body = await req.json();
    const action = (body.action as string) === "approve" ? "approve" : "reject";
    if (action === "approve") await mentors.approveRequest(id, auth.uid);
    else await mentors.rejectRequest(id, auth.uid);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

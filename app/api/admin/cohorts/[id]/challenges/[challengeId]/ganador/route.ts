import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as challenges from "@/lib/services/cohort-challenges";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; challengeId: string }> }
) {
  const user = await getAuthFromRequest(req);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id: cohortId, challengeId } = await params;
  const body = await req.json().catch(() => ({}));
  const teamId = (body.teamId as string)?.trim() || (body.userId as string)?.trim();
  if (!teamId) return NextResponse.json({ error: "teamId o userId requerido" }, { status: 400 });

  try {
    await challenges.setChallengeGanador(cohortId, challengeId, teamId);
    return NextResponse.json({ ok: true, ganador: teamId });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 500 });
  }
}

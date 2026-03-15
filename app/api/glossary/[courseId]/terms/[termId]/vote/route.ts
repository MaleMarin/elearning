/**
 * POST: vota por una propuesta (body: { proposalId, delta: 1 | -1 }).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as glossary from "@/lib/services/glossary";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; termId: string }> }
) {
  const { courseId, termId } = await params;
  if (!termId) return NextResponse.json({ error: "Falta termId" }, { status: 400 });
  if (getDemoMode()) return NextResponse.json({ ok: true });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    const body = await req.json();
    const proposalId = body.proposalId as string;
    const delta = body.delta === -1 ? -1 : 1;
    if (!proposalId) return NextResponse.json({ error: "Falta proposalId" }, { status: 400 });
    const previousVote = await glossary.getUserVote(auth.uid, courseId, termId);
    if (previousVote) {
      await glossary.voteProposal(courseId, termId, previousVote, -1);
    }
    await glossary.voteProposal(courseId, termId, proposalId, delta);
    await glossary.setUserVote(auth.uid, courseId, termId, proposalId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

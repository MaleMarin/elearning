/**
 * GET: lista propuestas de definición para el término.
 * POST: el alumno propone una definición.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as glossary from "@/lib/services/glossary";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; termId: string }> }
) {
  const { courseId, termId } = await params;
  if (!termId) return NextResponse.json({ error: "Falta termId" }, { status: 400 });
  if (getDemoMode()) {
    return NextResponse.json({
      proposals: [
        { id: "p1", userId: "u1", definition: "Definición propuesta por un alumno.", votes: 3, createdAt: new Date().toISOString() },
      ],
      topProposalId: "p1",
    });
  }
  if (!useFirebase()) return NextResponse.json({ proposals: [], topProposalId: null });
  try {
    const [proposals, topProposalId] = await Promise.all([
      glossary.listProposals(courseId, termId),
      glossary.getTopProposalId(courseId, termId),
    ]);
    return NextResponse.json({ proposals, topProposalId });
  } catch {
    return NextResponse.json({ proposals: [], topProposalId: null });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; termId: string }> }
) {
  const { courseId, termId } = await params;
  if (!termId) return NextResponse.json({ error: "Falta termId" }, { status: 400 });
  if (getDemoMode()) return NextResponse.json({ id: "demo-p", definition: "Demo" });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    const body = await req.json();
    const definition = (body.definition as string)?.trim();
    if (!definition) return NextResponse.json({ error: "Falta definition" }, { status: 400 });
    const proposal = await glossary.addProposal(courseId, termId, auth.uid, definition);
    return NextResponse.json(proposal);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

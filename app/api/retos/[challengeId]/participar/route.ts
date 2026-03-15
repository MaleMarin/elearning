import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  const { challengeId } = await params;
  if (!challengeId) return NextResponse.json({ error: "challengeId required" }, { status: 400 });
  // TODO: validar sesión y guardar participación en Firebase
  return NextResponse.json({ ok: true, retoId: challengeId, message: "Te has unido al reto" });
}

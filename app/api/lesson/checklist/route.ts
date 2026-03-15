/**
 * GET: estado de checklist de una lección (todos los bloques tipo checklist).
 * POST: marcar/desmarcar un ítem.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode } from "@/lib/env";
import {
  getLessonChecklistState,
  setChecklistItemChecked,
} from "@/lib/services/lessonBlocks.server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    if (getDemoMode()) {
      return NextResponse.json({ state: {} });
    }
    const auth = await getAuthFromRequest(req);
    const lessonId = req.nextUrl.searchParams.get("lessonId") ?? "";
    const blockId = req.nextUrl.searchParams.get("blockId") ?? "";
    if (!lessonId) {
      return NextResponse.json({ error: "Falta lessonId" }, { status: 400 });
    }
    const state = await getLessonChecklistState(auth.uid, lessonId);
    if (blockId) {
      return NextResponse.json({ state: state[blockId] ?? {} });
    }
    return NextResponse.json({ state });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (getDemoMode()) {
      return NextResponse.json({ ok: true });
    }
    const auth = await getAuthFromRequest(req);
    const body = await req.json();
    const lessonId = body.lessonId as string;
    const blockId = body.blockId as string;
    const itemId = body.itemId as string;
    const checked = body.checked === true;
    if (!lessonId || !blockId || !itemId) {
      return NextResponse.json(
        { error: "Faltan lessonId, blockId o itemId" },
        { status: 400 }
      );
    }
    await setChecklistItemChecked(auth.uid, lessonId, blockId, itemId, checked);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

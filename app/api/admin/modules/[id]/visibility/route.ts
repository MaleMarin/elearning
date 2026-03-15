/**
 * PATCH /api/admin/modules/[id]/visibility
 * Actualiza visibilityMode del módulo (solo admin/editor).
 */
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as firebaseContent from "@/lib/services/firebase-content";
import type { VisibilityMode } from "@/lib/types/module-content";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ module?: Record<string, unknown>; error?: string }>> {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Falta id del módulo" }, { status: 400 });

  if (getDemoMode()) return NextResponse.json({ error: "Demo" }, { status: 400 });

  if (!useFirebase()) return NextResponse.json({ error: "Backend no disponible" }, { status: 503 });

  try {
    const auth = await getAuthFromRequest(req);
    const canEdit = await firebaseContent.canEditModule(id, auth.uid, auth.role);
    if (!canEdit) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const mode = body.visibilityMode as string | undefined;
    if (mode !== "locked" && mode !== "preview" && mode !== "full") {
      return NextResponse.json({ error: "visibilityMode debe ser locked, preview o full" }, { status: 400 });
    }

    const module_ = await firebaseContent.updateModule(id, { visibilityMode: mode as VisibilityMode });
    revalidateTag("courses");
    revalidateTag("lessons");
    return NextResponse.json({ module: module_ as Record<string, unknown> });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : 500 });
  }
}

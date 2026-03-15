/**
 * GET: lista recursos del módulo.
 * POST: crea recurso (title, type, url?, storage_path?, description?).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as resources from "@/lib/services/resources";
import type { ResourceType } from "@/lib/services/resources";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: moduleId } = await params;
  if (!moduleId) return NextResponse.json({ error: "Falta id del módulo" }, { status: 400 });
  if (getDemoMode()) {
    return NextResponse.json({
      resources: [
        { id: "r1", module_id: moduleId, title: "Informe OCDE", type: "link_org", url: "https://www.oecd.org", description: "Enlace a OCDE", order: 0 },
        { id: "r2", module_id: moduleId, title: "Video intro", type: "video", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", description: null, order: 1 },
      ],
    });
  }
  if (!useFirebase()) return NextResponse.json({ resources: [] });
  try {
    const auth = await getAuthFromRequest(req);
    const canEdit = await firebaseContent.canEditModule(moduleId, auth.uid, auth.role);
    if (!canEdit) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    const list = await resources.listResourcesByModule(moduleId);
    return NextResponse.json({ resources: list });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: moduleId } = await params;
  if (!moduleId) return NextResponse.json({ error: "Falta id del módulo" }, { status: 400 });
  if (getDemoMode()) return NextResponse.json({ id: "demo-r", title: "Recurso demo" });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    const canEdit = await firebaseContent.canEditModule(moduleId, auth.uid, auth.role);
    if (!canEdit) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    const body = await req.json();
    const title = (body.title as string)?.trim();
    const type = (body.type as ResourceType) ?? "link";
    if (!title) return NextResponse.json({ error: "Falta título" }, { status: 400 });
    const resource = await resources.createResource(moduleId, {
      title,
      type,
      url: body.url ?? null,
      storage_path: body.storage_path ?? null,
      description: body.description ?? null,
      order: body.order ?? 0,
    });
    return NextResponse.json(resource);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

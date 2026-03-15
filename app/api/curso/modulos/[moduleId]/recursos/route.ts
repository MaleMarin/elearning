/**
 * GET: recursos del módulo para el alumno (con estado visto/no visto si hay sesión).
 */
import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as resources from "@/lib/services/resources";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  const { moduleId } = await params;
  if (!moduleId) return NextResponse.json({ error: "Falta moduleId" }, { status: 400 });

  if (getDemoMode()) {
    return NextResponse.json({
      resources: [
        { id: "r1", title: "Informe OCDE", type: "link_org", url: "https://www.oecd.org", description: "Enlace a OCDE", viewed: false },
        { id: "r2", title: "Video intro", type: "video", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", description: null, viewed: true },
      ],
      total: 2,
      viewedCount: 1,
    });
  }

  if (!useFirebase()) return NextResponse.json({ resources: [], total: 0, viewedCount: 0 });

  try {
    const list = await resources.listResourcesByModule(moduleId);
    let viewedIds = new Set<string>();
    try {
      const auth = await getAuthFromRequest(req);
      viewedIds = await resources.getViewedResourceIds(auth.uid, list.map((r) => r.id));
    } catch {
      // Sin sesión: ningún recurso marcado como visto
    }
    const resourcesWithViewed = list.map((r) => ({
      id: r.id,
      title: r.title,
      type: r.type,
      url: r.url,
      storage_path: r.storage_path,
      description: r.description,
      viewed: viewedIds.has(r.id),
    }));
    const viewedCount = resourcesWithViewed.filter((r) => r.viewed).length;
    return NextResponse.json({
      resources: resourcesWithViewed,
      total: list.length,
      viewedCount,
    });
  } catch {
    return NextResponse.json({ resources: [], total: 0, viewedCount: 0 });
  }
}

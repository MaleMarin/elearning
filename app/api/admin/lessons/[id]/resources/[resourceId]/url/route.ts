import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureContentEditor, getLessonResources } from "@/lib/services/content";

export const dynamic = "force-dynamic";

/** GET ?preview=1 para abrir en pestaña (inline); sin preview para descarga. */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; resourceId: string }> }
) {
  try {
    await ensureContentEditor();
    const { id: lessonId, resourceId } = await params;
    const { searchParams } = new URL(req.url);
    const preview = searchParams.get("preview") === "1";
    const resources = await getLessonResources(lessonId);
    const resource = resources.find((r) => r.id === resourceId);
    if (!resource) return NextResponse.json({ error: "Recurso no encontrado" }, { status: 404 });
    const admin = createAdminClient();
    const { data, error } = await admin.storage
      .from("resources")
      .createSignedUrl(resource.storage_path, 3600, { download: !preview });
    if (error) throw new Error(error.message);
    return NextResponse.json({ url: data.signedUrl });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "No autorizado" ? 401 : msg === "Solo admin o mentor" ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

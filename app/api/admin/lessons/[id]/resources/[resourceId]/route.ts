import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ensureContentEditor, getLessonResources, deleteLessonResource } from "@/lib/services/content";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; resourceId: string }> }
) {
  try {
    await ensureContentEditor();
    const { id: lessonId, resourceId } = await params;
    const resources = await getLessonResources(lessonId);
    const resource = resources.find((r) => r.id === resourceId);
    if (!resource) return NextResponse.json({ error: "Recurso no encontrado" }, { status: 404 });
    const supabase = await createServerSupabaseClient();
    await supabase.storage.from("resources").remove([resource.storage_path]);
    await deleteLessonResource(resourceId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "No autorizado" ? 401 : msg === "Solo admin o mentor" ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

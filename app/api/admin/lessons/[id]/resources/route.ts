import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  ensureContentEditor,
  getLessonResources,
  createLessonResource,
} from "@/lib/services/content";

export const dynamic = "force-dynamic";

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200) || "file";
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureContentEditor();
    const { id: lessonId } = await params;
    const resources = await getLessonResources(lessonId);
    return NextResponse.json({ resources });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "No autorizado" ? 401 : msg === "Solo admin o mentor" ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureContentEditor();
    const { id: lessonId } = await params;
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Falta archivo" }, { status: 400 });
    }
    const name = sanitizeFileName(file.name);
    const storagePath = `${lessonId}/${Date.now()}_${name}`;
    const supabase = await createServerSupabaseClient();
    const { error: uploadError } = await supabase.storage
      .from("resources")
      .upload(storagePath, file, { contentType: file.type || "application/octet-stream", upsert: false });
    if (uploadError) throw new Error(uploadError.message);
    const resource = await createLessonResource(lessonId, {
      name: file.name,
      storage_path: storagePath,
      mime_type: file.type || "application/octet-stream",
      size: file.size,
    });
    return NextResponse.json({ resource });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "No autorizado" ? 401 : msg === "Solo admin o mentor" ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}


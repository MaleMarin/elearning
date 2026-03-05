import { NextRequest, NextResponse } from "next/server";
import { ensureContentEditor, getCourse, updateCourse } from "@/lib/services/content";
import type { PublishStatus } from "@/lib/types/content";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureContentEditor();
    const { id } = await params;
    const course = await getCourse(id);
    return NextResponse.json({ course });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "No autorizado" ? 401 : msg === "Solo admin o mentor" ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureContentEditor();
    const { id } = await params;
    const body = await req.json();
    const updates: { title?: string; description?: string | null; status?: PublishStatus } = {};
    if (typeof body.title === "string") updates.title = body.title.trim();
    if (typeof body.description === "string") updates.description = body.description.trim() || null;
    if (body.status === "draft" || body.status === "published") updates.status = body.status;
    const course = await updateCourse(id, updates);
    return NextResponse.json({ course });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "No autorizado" ? 401 : msg === "Solo admin o mentor" ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

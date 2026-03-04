import { NextRequest, NextResponse } from "next/server";
import { ensureContentEditor, getLesson, updateLesson, deleteLesson } from "@/lib/services/content";
import type { PublishStatus } from "@/lib/types/content";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureContentEditor();
    const { id } = await params;
    const lesson = await getLesson(id);
    return NextResponse.json({ lesson });
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
    const updates: {
      title?: string;
      summary?: string;
      content?: string;
      video_embed_url?: string | null;
      estimated_minutes?: number | null;
      order_index?: number;
      status?: PublishStatus;
    } = {};
    if (typeof body.title === "string") updates.title = body.title.trim();
    if (typeof body.summary === "string") updates.summary = body.summary;
    if (typeof body.content === "string") updates.content = body.content;
    if (body.video_embed_url !== undefined) updates.video_embed_url = body.video_embed_url || null;
    if (body.estimated_minutes !== undefined) updates.estimated_minutes = body.estimated_minutes == null ? null : Number(body.estimated_minutes);
    if (typeof body.order_index === "number") updates.order_index = body.order_index;
    if (body.status === "draft" || body.status === "published") updates.status = body.status;
    const lesson = await updateLesson(id, updates);
    return NextResponse.json({ lesson });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "No autorizado" ? 401 : msg === "Solo admin o mentor" ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureContentEditor();
    const { id } = await params;
    await deleteLesson(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "No autorizado" ? 401 : msg === "Solo admin o mentor" ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as firebaseContent from "@/lib/services/firebase-content";
import { ensureContentEditor, getLesson, updateLesson, deleteLesson } from "@/lib/services/content";
import type { PublishStatus } from "@/lib/types/content";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (getDemoMode()) return NextResponse.json({ error: "Demo" }, { status: 404 });
  if (useFirebase()) {
    try {
      const auth = await getAuthFromRequest(req);
      const { id } = await params;
      const canEdit = await firebaseContent.canEditLesson(id, auth.uid, auth.role);
      if (!canEdit) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
      const lesson = await firebaseContent.getLesson(id);
      return NextResponse.json({ lesson });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : msg === "Lección no encontrada" ? 404 : 500 });
    }
  }
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
  if (getDemoMode()) return NextResponse.json({ error: "Demo" }, { status: 400 });
  if (useFirebase()) {
    try {
      const auth = await getAuthFromRequest(req);
      const { id } = await params;
      const canEdit = await firebaseContent.canEditLesson(id, auth.uid, auth.role);
      if (!canEdit) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
      const body = await req.json().catch(() => ({}));
      const updates: {
        title?: string;
        summary?: string;
        content?: string;
        video_embed_url?: string | null;
        estimated_minutes?: number | null;
        order_index?: number;
        status?: PublishStatus;
        h5p_content_id?: string | null;
        blocks?: unknown[];
        competencias?: { id: string; nivel: string }[];
      } = {};
      if (typeof body.title === "string") updates.title = body.title.trim();
      if (typeof body.summary === "string") updates.summary = body.summary;
      if (typeof body.content === "string") updates.content = body.content;
      if (body.video_embed_url !== undefined) updates.video_embed_url = body.video_embed_url || null;
      if (body.estimated_minutes !== undefined) updates.estimated_minutes = body.estimated_minutes == null ? null : Number(body.estimated_minutes);
      if (typeof body.order_index === "number") updates.order_index = body.order_index;
      if (body.status === "draft" || body.status === "published") updates.status = body.status;
      if (body.h5p_content_id !== undefined) updates.h5p_content_id = body.h5p_content_id || null;
      if (Array.isArray(body.blocks)) updates.blocks = body.blocks;
      if (Array.isArray(body.competencias)) {
        updates.competencias = body.competencias.filter(
          (c: unknown): c is { id: string; nivel: string } =>
            typeof c === "object" && c !== null && typeof (c as { id?: string }).id === "string" && typeof (c as { nivel?: string }).nivel === "string"
        );
      }
      const lesson = await firebaseContent.updateLesson(id, updates);
      revalidateTag("lessons");
      revalidateTag(`lesson-${id}`);
      revalidateTag("courses");
      return NextResponse.json({ lesson });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : 500 });
    }
  }
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
    revalidateTag("lessons");
    revalidateTag("courses");
    return NextResponse.json({ lesson });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "No autorizado" ? 401 : msg === "Solo admin o mentor" ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (getDemoMode()) return NextResponse.json({ ok: true });
  if (useFirebase()) {
    try {
      const auth = await getAuthFromRequest(req);
      const { id } = await params;
      const canEdit = await firebaseContent.canEditLesson(id, auth.uid, auth.role);
      if (!canEdit) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
      await firebaseContent.deleteLesson(id);
      revalidateTag("lessons");
      revalidateTag(`lesson-${id}`);
      revalidateTag("courses");
      return NextResponse.json({ ok: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : 500 });
    }
  }
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

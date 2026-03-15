import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as firebaseContent from "@/lib/services/firebase-content";
import { ensureContentEditor, getLessons, createLesson } from "@/lib/services/content";
import type { PublishStatus } from "@/lib/types/content";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (getDemoMode()) return NextResponse.json({ lessons: [] });
  if (useFirebase()) {
    try {
      const auth = await getAuthFromRequest(req);
      const { id: moduleId } = await params;
      const canEdit = await firebaseContent.canEditModule(moduleId, auth.uid, auth.role);
      if (!canEdit) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
      const lessons = await firebaseContent.getLessons(moduleId);
      return NextResponse.json({ lessons });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : 500 });
    }
  }
  try {
    await ensureContentEditor();
    const { id: moduleId } = await params;
    const lessons = await getLessons(moduleId);
    return NextResponse.json({ lessons });
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
  if (getDemoMode()) return NextResponse.json({ error: "Demo" }, { status: 400 });
  if (useFirebase()) {
    try {
      const auth = await getAuthFromRequest(req);
      const { id: moduleId } = await params;
      const canEdit = await firebaseContent.canEditModule(moduleId, auth.uid, auth.role);
      if (!canEdit) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
      const body = await req.json().catch(() => ({}));
      const title = (body.title as string)?.trim();
      const summary = (body.summary as string) ?? "";
      const content = (body.content as string) ?? "";
      const video_embed_url = body.video_embed_url as string | undefined;
      const estimated_minutes = body.estimated_minutes != null ? Number(body.estimated_minutes) : null;
      const order_index = Number(body.order_index) ?? 0;
      const status = (body.status as PublishStatus) ?? "draft";
      if (!title) return NextResponse.json({ error: "Falta title" }, { status: 400 });
      const lesson = await firebaseContent.createLesson(moduleId, {
        title,
        summary,
        content,
        video_embed_url: video_embed_url || null,
        estimated_minutes,
        order_index,
        status,
      });
      return NextResponse.json({ lesson });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : 500 });
    }
  }
  try {
    await ensureContentEditor();
    const { id: moduleId } = await params;
    const body = await req.json();
    const title = body.title as string;
    const summary = (body.summary as string) ?? "";
    const content = (body.content as string) ?? "";
    const video_embed_url = body.video_embed_url as string | undefined;
    const estimated_minutes = body.estimated_minutes != null ? Number(body.estimated_minutes) : null;
    const order_index = Number(body.order_index) ?? 0;
    const status = (body.status as PublishStatus) ?? "draft";
    if (!title?.trim()) return NextResponse.json({ error: "Falta title" }, { status: 400 });
    const lesson = await createLesson(moduleId, {
      title: title.trim(),
      summary,
      content,
      video_embed_url: video_embed_url || null,
      estimated_minutes,
      order_index,
      status,
    });
    return NextResponse.json({ lesson });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "No autorizado" ? 401 : msg === "Solo admin o mentor" ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

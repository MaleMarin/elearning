import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as firebaseContent from "@/lib/services/firebase-content";
import { ensureContentEditor, getModule, updateModule, deleteModule } from "@/lib/services/content";
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
      const canEdit = await firebaseContent.canEditModule((await params).id, auth.uid, auth.role);
      if (!canEdit) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
      const module_ = await firebaseContent.getModule((await params).id);
      return NextResponse.json({ module: module_ });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : msg === "Módulo no encontrado" ? 404 : 500 });
    }
  }
  try {
    await ensureContentEditor();
    const { id } = await params;
    const module_ = await getModule(id);
    return NextResponse.json({ module: module_ });
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
      const canEdit = await firebaseContent.canEditModule(id, auth.uid, auth.role);
      if (!canEdit) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
      const body = await req.json().catch(() => ({}));
      const updates: { title?: string; description?: string | null; order_index?: number; status?: PublishStatus; requiresCompletion?: string[]; requiresQuiz?: string[]; objectives?: string[]; reward_label?: string | null } = {};
      if (typeof body.title === "string") updates.title = body.title.trim();
      if (typeof body.description === "string") updates.description = body.description.trim() || null;
      if (typeof body.order_index === "number") updates.order_index = body.order_index;
      if (body.status === "draft" || body.status === "published") updates.status = body.status;
      if (Array.isArray(body.requiresCompletion)) updates.requiresCompletion = body.requiresCompletion.filter((x: unknown) => typeof x === "string");
      if (Array.isArray(body.requiresQuiz)) updates.requiresQuiz = body.requiresQuiz.filter((x: unknown) => typeof x === "string");
      if (Array.isArray(body.objectives)) updates.objectives = body.objectives.filter((x: unknown) => typeof x === "string");
      if (typeof body.reward_label === "string") updates.reward_label = body.reward_label.trim() || null;
      const module_ = await firebaseContent.updateModule(id, updates);
      revalidateTag("courses");
      revalidateTag("lessons");
      return NextResponse.json({ module: module_ });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : 500 });
    }
  }
  try {
    await ensureContentEditor();
    const { id } = await params;
    const body = await req.json();
    const updates: { title?: string; description?: string | null; order_index?: number; status?: PublishStatus } = {};
    if (typeof body.title === "string") updates.title = body.title.trim();
    if (typeof body.description === "string") updates.description = body.description.trim() || null;
    if (typeof body.order_index === "number") updates.order_index = body.order_index;
    if (body.status === "draft" || body.status === "published") updates.status = body.status;
    const module_ = await updateModule(id, updates);
    revalidateTag("courses");
    revalidateTag("lessons");
    return NextResponse.json({ module: module_ });
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
      const canEdit = await firebaseContent.canEditModule(id, auth.uid, auth.role);
      if (!canEdit) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
      await firebaseContent.deleteModule(id);
      revalidateTag("courses");
      revalidateTag("lessons");
      return NextResponse.json({ ok: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : 500 });
    }
  }
  try {
    await ensureContentEditor();
    const { id } = await params;
    await deleteModule(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "No autorizado" ? 401 : msg === "Solo admin o mentor" ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

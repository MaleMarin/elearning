import { NextRequest, NextResponse } from "next/server";
import { ensureContentEditor, getModules, createModule } from "@/lib/services/content";
import type { PublishStatus } from "@/lib/types/content";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureContentEditor();
    const { id: courseId } = await params;
    const modules = await getModules(courseId);
    return NextResponse.json({ modules });
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
    const { id: courseId } = await params;
    const body = await req.json();
    const title = body.title as string;
    const orderIndex = Number(body.order_index) ?? 0;
    const status = (body.status as PublishStatus) ?? "draft";
    const description = typeof body.description === "string" ? body.description.trim() || null : null;
    if (!title?.trim()) return NextResponse.json({ error: "Falta title" }, { status: 400 });
    const module_ = await createModule(courseId, title.trim(), orderIndex, status, description);
    return NextResponse.json({ module: module_ });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "No autorizado" ? 401 : msg === "Solo admin o mentor" ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

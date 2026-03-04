import { NextRequest, NextResponse } from "next/server";
import { ensureContentEditor, getEditableCourses, createCourse } from "@/lib/services/content";
import { auditLog, getClientIp } from "@/lib/services/audit";
import type { PublishStatus } from "@/lib/types/content";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureContentEditor();
    const courses = await getEditableCourses();
    return NextResponse.json({ courses });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "No autorizado" ? 401 : msg === "Solo admin o mentor" ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, role } = await ensureContentEditor();
    const body = await req.json();
    const title = body.title as string;
    const status = (body.status as PublishStatus) ?? "draft";
    if (!title?.trim()) return NextResponse.json({ error: "Falta title" }, { status: 400 });
    const course = await createCourse(title.trim(), status);
    await auditLog({
      userId: user.id,
      role,
      action: "course.create",
      resourceType: "course",
      resourceId: course.id,
      payload: { title: course.title, status: course.status },
      ip: getClientIp(req),
    });
    return NextResponse.json({ course });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "No autorizado" ? 401 : msg === "Solo admin o mentor" ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

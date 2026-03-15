import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as firebaseContent from "@/lib/services/firebase-content";
import { auditLog, getClientIp } from "@/lib/services/audit";
import type { PublishStatus } from "@/lib/types/content";

export const dynamic = "force-dynamic";

const IS_DEV = process.env.NODE_ENV === "development";

export async function GET(req: NextRequest) {
  if (getDemoMode()) {
    const payload: { courses: unknown[]; _debug?: { role: string; email?: string } } = { courses: [] };
    if (IS_DEV) payload._debug = { role: "admin", email: "demo@precisar.local" };
    return NextResponse.json(payload);
  }

  if (!useFirebase()) {
    return NextResponse.json({ error: "Backend no configurado" }, { status: 500 });
  }

  let uid: string;
  let role: string;
  try {
    const auth = await getAuthFromRequest(req);
    uid = auth.uid;
    role = auth.role;
  } catch {
    return NextResponse.json({ error: "no_session" }, { status: 401 });
  }

  if (role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const courses = await firebaseContent.listCourses();
    const payload: { courses: unknown[]; _debug?: { role: string; email: string | null } } = {
      courses: courses as unknown[],
    };
    if (IS_DEV) payload._debug = { role, email: null };
    return NextResponse.json(payload);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json(
      { error: msg, ...(IS_DEV && { _debug: { message: msg } }) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (getDemoMode()) {
    const body = await req.json().catch(() => ({}));
    const title = (body.title as string)?.trim() || "Curso demo";
    const id = `demo-${Date.now()}`;
    const course = {
      id,
      title,
      status: (body.status as PublishStatus) ?? "draft",
      description: typeof body.description === "string" ? body.description.trim() || null : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return NextResponse.json({ course });
  }

  if (!useFirebase()) {
    return NextResponse.json({ error: "Backend no configurado" }, { status: 500 });
  }

  let uid: string;
  let role: string;
  try {
    const auth = await getAuthFromRequest(req);
    uid = auth.uid;
    role = auth.role;
  } catch {
    return NextResponse.json({ error: "no_session" }, { status: 401 });
  }

  if (role !== "admin" && role !== "mentor") {
    return NextResponse.json({ error: "Solo admin o mentor" }, { status: 403 });
  }

  const editableIds = await firebaseContent.getEditableCourseIds(uid, role);
  const body = await req.json().catch(() => ({}));
  const title = (body.title as string)?.trim();
  const status = (body.status as PublishStatus) ?? "draft";
  const description = typeof body.description === "string" ? body.description.trim() || null : null;
  if (!title) return NextResponse.json({ error: "Falta title" }, { status: 400 });

  try {
    const course = await firebaseContent.createCourse(uid, title, status, description);
    await auditLog({
      userId: uid,
      role,
      action: "course.create",
      resourceType: "course",
      resourceId: course.id as string,
      payload: { title: course.title, status: course.status },
      ip: getClientIp(req),
    });
    return NextResponse.json({ course });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const statusCode = msg === "No autorizado" ? 401 : msg === "Solo admin o mentor" ? 403 : 500;
    return NextResponse.json({ error: msg }, { status: statusCode });
  }
}

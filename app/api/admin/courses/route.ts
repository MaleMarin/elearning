import { NextRequest, NextResponse } from "next/server";
import { getDemoMode } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ensureContentEditor, createCourse } from "@/lib/services/content";
import { auditLog, getClientIp } from "@/lib/services/audit";
import type { PublishStatus } from "@/lib/types/content";

export const dynamic = "force-dynamic";

const IS_DEV = process.env.NODE_ENV === "development";

/**
 * GET /api/admin/courses
 * - DEMO_MODE=true: devuelve { courses: [] } (mock).
 * - DEMO_MODE=false: lee desde Supabase (public.courses), order by created_at desc.
 * Cliente con cookies (anon). 401 sin sesión, 403 si role !== 'admin'.
 */
export async function GET() {
  if (getDemoMode()) {
    const payload: { courses: unknown[]; _debug?: { role: string; email?: string } } = { courses: [] };
    if (IS_DEV) payload._debug = { role: "admin", email: "demo@precisar.local" };
    return NextResponse.json(payload);
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "no_session" }, { status: 401 });
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = (profile?.role as string) ?? "student";

  if (role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { data: courses, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message, ...(IS_DEV && { _debug: { message: error.message } }) },
      { status: 500 }
    );
  }

  const payload: { courses: unknown[]; _debug?: { role: string; email: string | undefined } } = {
    courses: courses ?? [],
  };
  if (IS_DEV) {
    payload._debug = { role, email: user.email ?? undefined };
  }
  return NextResponse.json(payload);
}

/**
 * POST /api/admin/courses
 * - DEMO_MODE=true: devuelve curso mock (no persiste).
 * - DEMO_MODE=false: inserta en public.courses (title, description, status, created_by) y persiste.
 */
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

  try {
    const { user, role } = await ensureContentEditor();
    const body = await req.json();
    const title = body.title as string;
    const status = (body.status as PublishStatus) ?? "draft";
    const description = typeof body.description === "string" ? body.description.trim() || null : null;
    if (!title?.trim()) return NextResponse.json({ error: "Falta title" }, { status: 400 });
    const course = await createCourse(title.trim(), status, description);
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

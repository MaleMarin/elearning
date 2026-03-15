import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as courseFeatures from "@/lib/services/course-features";
import type { CourseFeatures } from "@/lib/types/course-features";
import { DEFAULT_COURSE_FEATURES } from "@/lib/types/course-features";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (getDemoMode()) {
    return NextResponse.json({ features: { ...DEFAULT_COURSE_FEATURES } }, { status: 200 });
  }
  if (!useFirebase()) {
    return NextResponse.json({ error: "Solo disponible con Firebase" }, { status: 400 });
  }
  try {
    const auth = await getAuthFromRequest(req);
    const editableIds = await firebaseContent.getEditableCourseIds(auth.uid, auth.role);
    const { id } = await params;
    if (!editableIds.includes(id)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    const features = await courseFeatures.getCourseFeatures(id);
    return NextResponse.json({ features });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "No autorizado" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (getDemoMode()) {
    return NextResponse.json({ error: "Demo" }, { status: 400 });
  }
  if (!useFirebase()) {
    return NextResponse.json({ error: "Solo disponible con Firebase" }, { status: 400 });
  }
  try {
    const auth = await getAuthFromRequest(req);
    const editableIds = await firebaseContent.getEditableCourseIds(auth.uid, auth.role);
    const { id } = await params;
    if (!editableIds.includes(id)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    const body = (await req.json().catch(() => ({}))) as Partial<CourseFeatures>;
    const keys = Object.keys(body) as (keyof CourseFeatures)[];
    const updates: Partial<CourseFeatures> = {};
    for (const k of keys) {
      if (typeof body[k] === "boolean") updates[k] = body[k];
    }
    const features = await courseFeatures.updateCourseFeatures(id, updates);
    revalidateTag(`course-${id}`);
    return NextResponse.json({ features });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "No autorizado" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as firebaseContent from "@/lib/services/firebase-content";
import { ensureContentEditor, getCourse, updateCourse } from "@/lib/services/content";
import type { PublishStatus } from "@/lib/types/content";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (getDemoMode()) {
    return NextResponse.json({ error: "Demo: sin curso" }, { status: 404 });
  }
  if (useFirebase()) {
    try {
      const auth = await getAuthFromRequest(req);
      const editableIds = await firebaseContent.getEditableCourseIds(auth.uid, auth.role);
      const { id } = await params;
      if (!editableIds.includes(id)) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
      }
      const course = await firebaseContent.getCourse(id);
      const coAuthorIds = (course.coAuthors as string[]) ?? [];
      const coAuthorDetails: { id: string; full_name: string; email: string | null }[] = [];
      if (coAuthorIds.length > 0) {
        const db = (await import("@/lib/firebase/admin")).getFirebaseAdminFirestore();
        for (const uid of coAuthorIds) {
          const snap = await db.collection("profiles").doc(uid).get();
          const d = snap.data();
          coAuthorDetails.push({
            id: uid,
            full_name: (d?.full_name as string)?.trim() || "Sin nombre",
            email: (d?.email as string) ?? null,
          });
        }
      }
      return NextResponse.json({ course, coAuthorDetails });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      const status = msg === "No autorizado" ? 401 : msg === "Curso no encontrado" ? 404 : 500;
      return NextResponse.json({ error: msg }, { status });
    }
  }
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
  if (getDemoMode()) {
    return NextResponse.json({ error: "Demo" }, { status: 400 });
  }
  if (useFirebase()) {
    try {
      const auth = await getAuthFromRequest(req);
      const editableIds = await firebaseContent.getEditableCourseIds(auth.uid, auth.role);
      const { id } = await params;
      if (!editableIds.includes(id)) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
      }
      const body = await req.json().catch(() => ({}));
      const updates: { title?: string; description?: string | null; status?: PublishStatus; coAuthors?: string[] } = {};
      if (typeof body.title === "string") updates.title = body.title.trim();
      if (typeof body.description === "string") updates.description = body.description.trim() || null;
      if (body.status === "draft" || body.status === "published") updates.status = body.status;
      if (Array.isArray(body.coAuthors)) updates.coAuthors = body.coAuthors.filter((u: unknown) => typeof u === "string");
      const course = await firebaseContent.updateCourse(id, updates);
      revalidateTag("courses");
      revalidateTag(`course-${id}`);
      revalidateTag("lessons");
      return NextResponse.json({ course });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      const status = msg === "No autorizado" ? 401 : msg === "Solo admin o mentor" ? 403 : 500;
      return NextResponse.json({ error: msg }, { status });
    }
  }
  try {
    await ensureContentEditor();
    const { id } = await params;
    const body = await req.json();
    const updates: { title?: string; description?: string | null; status?: PublishStatus } = {};
    if (typeof body.title === "string") updates.title = body.title.trim();
    if (typeof body.description === "string") updates.description = body.description.trim() || null;
    if (body.status === "draft" || body.status === "published") updates.status = body.status;
    const course = await updateCourse(id, updates);
    revalidateTag("courses");
    revalidateTag("lessons");
    return NextResponse.json({ course });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "No autorizado" ? 401 : msg === "Solo admin o mentor" ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

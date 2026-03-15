import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as firebaseContent from "@/lib/services/firebase-content";
import type { PublishStatus } from "@/lib/types/content";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (getDemoMode()) {
    return NextResponse.json({ error: "Demo: duplicar no disponible" }, { status: 400 });
  }
  if (!useFirebase()) {
    return NextResponse.json({ error: "Backend no configurado" }, { status: 500 });
  }

  try {
    const auth = await getAuthFromRequest(_req);
    const editableIds = await firebaseContent.getEditableCourseIds(auth.uid, auth.role);
    const { id: courseId } = await params;
    if (!editableIds.includes(courseId)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const course = await firebaseContent.getCourse(courseId);
    const title = `${String(course.title ?? "Curso")} — Copia`;
    const newCourse = await firebaseContent.createCourse(
      auth.uid,
      title,
      "draft" as PublishStatus,
      (course.description as string) ?? null
    );
    const newCourseId = newCourse.id as string;

    const modules = await firebaseContent.getModules(courseId);
    const moduleIdMap = new Map<string, string>();

    for (const mod of modules) {
      const newMod = await firebaseContent.createModule(
        newCourseId,
        mod.title as string,
        (mod.order_index as number) ?? 0,
        "draft" as PublishStatus,
        (mod.description as string) ?? null
      );
      const newModuleId = newMod.id as string;
      moduleIdMap.set(mod.id as string, newModuleId);

      const extra: Record<string, unknown> = {};
      if (Array.isArray(mod.bibliography) && mod.bibliography.length > 0) extra.bibliography = mod.bibliography;
      if (Array.isArray(mod.podcasts) && mod.podcasts.length > 0) extra.podcasts = mod.podcasts;
      if (Array.isArray(mod.videos) && mod.videos.length > 0) extra.videos = mod.videos;
      if (mod.liveRecording != null) extra.liveRecording = mod.liveRecording;
      if (Object.keys(extra).length > 0) {
        await firebaseContent.updateModule(newModuleId, extra);
      }
    }

    for (const mod of modules) {
      const newModuleId = moduleIdMap.get(mod.id as string);
      if (!newModuleId) continue;
      const lessons = await firebaseContent.getLessons(mod.id as string);
      for (const lesson of lessons) {
        await firebaseContent.createLesson(newModuleId, {
          title: lesson.title as string,
          summary: (lesson.summary as string) ?? "",
          content: (lesson.content as string) ?? "",
          video_embed_url: (lesson.video_embed_url as string) ?? null,
          estimated_minutes: (lesson.estimated_minutes as number) ?? null,
          order_index: (lesson.order_index as number) ?? 0,
          status: "draft" as PublishStatus,
          source_community: (lesson.source_community as boolean) ?? false,
          proposal_id: (lesson.proposal_id as string) ?? null,
          community_author_id: (lesson.community_author_id as string) ?? null,
        });
      }
    }

    revalidateTag("courses");
    revalidateTag("modules");
    revalidateTag("lessons");

    return NextResponse.json({ courseId: newCourseId, title });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "No autorizado" ? 401 : msg === "Curso no encontrado" ? 404 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

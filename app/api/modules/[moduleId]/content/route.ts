/**
 * GET /api/modules/[moduleId]/content
 * Devuelve módulo, contenido teórico y estado de acceso para la página del módulo.
 */
import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as moduleAccess from "@/lib/services/module-access";
import { parseModuleContent } from "@/lib/services/module-content";
import * as quizService from "@/lib/services/quiz";
import type { BibliographyItem, PodcastItem, VideoItem, LiveRecording } from "@/lib/types/module-content";

export const dynamic = "force-dynamic";

const DEMO_BIB: BibliographyItem[] = [
  { id: "b1", tipo: "libro", titulo: "La innovación pública al servicio del ciudadano", autor: "OCDE", año: 2023, descripcion: "Marco conceptual de la OCDE para modernizar los servicios públicos en América Latina.", url: "https://www.oecd.org/gov/innov", obligatorio: true },
  { id: "b2", tipo: "paper", titulo: "Design thinking en el sector público mexicano", autor: "CIDE", año: 2022, descripcion: "Casos de aplicación en 5 dependencias federales de México.", obligatorio: true },
];
const DEMO_PODCASTS: PodcastItem[] = [
  { id: "p1", titulo: "Ep. 34 — Innovación desde adentro del gobierno", programa: "GovTech Latinoamérica", descripcion: "Entrevista con servidores públicos que transformaron sus áreas.", duracion: "38 min", url: "https://open.spotify.com/episode/example" },
];
const DEMO_VIDEOS: VideoItem[] = [
  { id: "v1", titulo: "Qué es la innovación pública — en 5 minutos", canal: "BID", descripcion: "Introducción al concepto de innovación en el sector público.", duracion: "5 min", youtubeId: "dQw4w9WgXcQ", esObligatorio: true },
];
const DEMO_RECORDING: LiveRecording | null = {
  sessionDate: "2025-02-15",
  titulo: "Sesión en vivo — Módulo 1",
  facilitador: "Equipo Política Digital",
  duracion: "60 min",
  youtubeId: "dQw4w9WgXcQ",
};

export interface ModuleContentApiResponse {
  module: {
    id: string;
    courseId: string;
    title: string;
    description: string | null;
    order: number;
    visibilityMode: string;
    /** Objetivos de aprendizaje (landing por módulo). */
    objectives?: string[];
    /** Recompensa/insignia al completar el módulo. */
    rewardLabel?: string | null;
  };
  content: {
    bibliography: BibliographyItem[];
    podcasts: PodcastItem[];
    videos: VideoItem[];
    liveRecording: LiveRecording | null;
  };
  access: {
    canAccess: boolean;
    canSeeContent: boolean;
    canSeeExercises: boolean;
    reason: string;
  };
  lessons?: { id: string; title: string; order_index: number }[];
  allLessonsCompleted?: boolean;
  quizId?: string | null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
): Promise<NextResponse<ModuleContentApiResponse | { error: string }>> {
  const { moduleId } = await params;
  if (!moduleId) return NextResponse.json({ error: "Falta moduleId" }, { status: 400 });

  if (getDemoMode()) {
    return NextResponse.json({
      module: {
        id: moduleId,
        courseId: "demo-course",
        title: "Módulo 1 — Innovación pública",
        description: "Introducción a la innovación en el sector público.",
        order: 1,
        visibilityMode: "preview",
        objectives: ["Comprender el concepto de innovación pública.", "Identificar casos de aplicación en gobierno."],
        rewardLabel: "Insignia Módulo 1",
      },
      content: {
        bibliography: DEMO_BIB,
        podcasts: DEMO_PODCASTS,
        videos: DEMO_VIDEOS,
        liveRecording: DEMO_RECORDING,
      },
      access: {
        canAccess: true,
        canSeeContent: true,
        canSeeExercises: true,
        reason: "Acceso completo",
      },
      lessons: [{ id: "l1", title: "Lección 1", order_index: 0 }],
      allLessonsCompleted: false,
      quizId: null,
    });
  }

  if (!useFirebase()) {
    return NextResponse.json({ error: "Backend no disponible" }, { status: 503 });
  }

  try {
    const auth = await getAuthFromRequest(req);
    const moduleDoc = await firebaseContent.getModule(moduleId);
    const courseId = moduleDoc.course_id as string;
    const access = await moduleAccess.canAccessModule(auth.uid, moduleId, courseId);
    const parsed = parseModuleContent(moduleDoc as Record<string, unknown>);

    const lessons = await firebaseContent.getLessons(moduleId);
    const publishedLessons = lessons.filter((l) => l.status === "published");
    const completedIds = await moduleAccess.getCompletedLessonIds(auth.uid, courseId);
    const allLessonsCompleted =
      publishedLessons.length > 0 && publishedLessons.every((l) => completedIds.includes(l.id as string));

    const quizzes = await quizService.listQuizzes(courseId);
    const quizForModule = quizzes.find((q) => q.moduleId === moduleId);
    const quizId = quizForModule?.id ?? null;

    const payload: ModuleContentApiResponse = {
      module: {
        id: moduleDoc.id as string,
        courseId,
        title: moduleDoc.title as string,
        description: (moduleDoc.description as string) ?? null,
        order: (moduleDoc.order_index as number) ?? 0,
        visibilityMode: parsed.visibilityMode,
        objectives: Array.isArray(moduleDoc.objectives) ? (moduleDoc.objectives as string[]) : undefined,
        rewardLabel: (moduleDoc.reward_label as string) ?? (moduleDoc.rewardLabel as string) ?? null,
      },
      content: {
        bibliography: parsed.bibliography,
        podcasts: parsed.podcasts,
        videos: parsed.videos,
        liveRecording: parsed.liveRecording,
      },
      access: {
        canAccess: access.canAccess,
        canSeeContent: access.canSeeContent,
        canSeeExercises: access.canSeeExercises,
        reason: access.reason,
      },
      lessons: publishedLessons.map((l) => ({
        id: l.id as string,
        title: l.title as string,
        order_index: (l.order_index as number) ?? 0,
      })),
      allLessonsCompleted,
      quizId,
    };
    return NextResponse.json(payload);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json(
      { error: msg },
      { status: msg === "No autorizado" || msg === "Módulo no encontrado" ? (msg === "No autorizado" ? 401 : 404) : 500 }
    );
  }
}

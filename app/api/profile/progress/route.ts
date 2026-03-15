import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as firebaseProgress from "@/lib/services/firebase-progress";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as profileService from "@/lib/services/profile";
import type { BadgeId } from "@/lib/services/profile";

export const dynamic = "force-dynamic";

export interface ProgressResponse {
  lessonsCompleted: number;
  lessonsTotal: number;
  totalMinutesOnPlatform: number;
  streakDays: number;
  certificatePercent: number | null;
  certificateAvailable: boolean;
  totalPoints: number;
  badges: { id: BadgeId; earned: boolean; earnedAt?: string }[];
}

function demoProgress(): ProgressResponse {
  return {
    lessonsCompleted: 1,
    lessonsTotal: 6,
    totalMinutesOnPlatform: 120,
    streakDays: 2,
    certificatePercent: 16,
    certificateAvailable: false,
    totalPoints: 25,
    badges: [
      { id: "first_lesson", earned: true, earnedAt: new Date().toISOString() },
      { id: "streak_3", earned: false },
      { id: "module_complete", earned: false },
      { id: "halfway", earned: false },
      { id: "certificate", earned: false },
    ],
  };
}

/** GET: progreso y badges calculados */
export async function GET(req: NextRequest) {
  try {
    if (getDemoMode()) {
      return NextResponse.json(demoProgress());
    }
    const auth = await getAuthFromRequest(req);
    if (!useFirebase()) {
      return NextResponse.json(demoProgress());
    }

    const enrollment = await firebaseContent.getActiveEnrollmentForUser(auth.uid);
    const cohortId = enrollment?.cohort_id ?? null;
    const courseId = cohortId
      ? await firebaseContent.getPrimaryCourseForCohort(cohortId)
      : null;

    let lessonsTotal = 0;
    let lessonsCompleted = 0;
    const moduleIds: string[] = [];
    const allLessons: { id: string; module_id: string }[] = [];
    let completedLessonIds: string[] = [];

    if (courseId) {
      const modules = await firebaseContent.getPublishedModules(courseId);
      moduleIds.push(...modules.map((m) => m.id));
      const lessons = await firebaseContent.getPublishedLessons(moduleIds);
      allLessons.push(...lessons.map((l) => ({ id: l.id, module_id: l.module_id })));
      lessonsTotal = lessons.length;
      const progress = await firebaseProgress.getProgress(auth.uid, courseId);
      completedLessonIds = progress.completedLessonIds;
      const publishedIds = new Set(lessons.map((l) => l.id));
      lessonsCompleted = completedLessonIds.filter((id) => publishedIds.has(id)).length;
    }

    const userProfile = await profileService.getProfile(auth.uid);
    const totalMinutesOnPlatform = userProfile?.totalMinutesOnPlatform ?? 0;
    const streakDays = userProfile?.streakDays ?? 0;
    const totalPoints = userProfile?.totalPoints ?? 0;

    const percent =
      lessonsTotal > 0 ? Math.round((lessonsCompleted / lessonsTotal) * 100) : 0;
    const certificateAvailable = lessonsTotal > 0 && lessonsCompleted >= lessonsTotal;

    const earnedBadges = await profileService.getBadges(auth.uid);
    const earnedSet = new Set(earnedBadges.map((b) => b.id));
    const earnedAtMap = new Map(earnedBadges.map((b) => [b.id, b.earnedAt]));

    const now = new Date().toISOString();
    if (lessonsCompleted >= 1 && !earnedSet.has("first_lesson")) {
      await profileService.setBadge(auth.uid, "first_lesson");
      earnedSet.add("first_lesson");
      earnedAtMap.set("first_lesson", now);
    }
    if (streakDays >= 3 && !earnedSet.has("streak_3")) {
      await profileService.setBadge(auth.uid, "streak_3");
      earnedSet.add("streak_3");
      earnedAtMap.set("streak_3", now);
    }
    if (percent >= 50 && !earnedSet.has("halfway")) {
      await profileService.setBadge(auth.uid, "halfway");
      earnedSet.add("halfway");
      earnedAtMap.set("halfway", now);
    }
    const completedSet = new Set(completedLessonIds);
    const oneModuleComplete =
      allLessons.length > 0 &&
      Array.from(new Set(allLessons.map((l) => l.module_id))).some((mid) => {
        const moduleLessons = allLessons.filter((l) => l.module_id === mid);
        return moduleLessons.every((l) => completedSet.has(l.id));
      });
    if (oneModuleComplete && !earnedSet.has("module_complete")) {
      await profileService.setBadge(auth.uid, "module_complete");
      earnedSet.add("module_complete");
      earnedAtMap.set("module_complete", now);
    }
    if (certificateAvailable && !earnedSet.has("certificate")) {
      await profileService.setBadge(auth.uid, "certificate");
      earnedSet.add("certificate");
      earnedAtMap.set("certificate", now);
    }

    const badges: ProgressResponse["badges"] = profileService.getAllBadgeIds().map((id) => ({
      id,
      earned: earnedSet.has(id),
      earnedAt: earnedAtMap.get(id),
    }));

    return NextResponse.json({
      lessonsCompleted,
      lessonsTotal,
      totalMinutesOnPlatform,
      streakDays,
      certificatePercent: lessonsTotal > 0 ? percent : null,
      certificateAvailable,
      totalPoints,
      badges,
    });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

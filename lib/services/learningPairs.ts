/**
 * Aprendo con un colega: emparejamiento y chat.
 * Firestore:
 *   learning_pair_preferences/{userId}: { lookingForPartner, cohortId, updatedAt }
 *   learning_pairs/{pairId}: { userA, userB, moduleId, cohortId, courseId, status, createdAt, completedAt?, expiresAt? }
 *   learning_pairs/{pairId}/messages/{msgId}: { userId, text, createdAt }
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as firebaseProgress from "@/lib/services/firebase-progress";
import * as profileService from "@/lib/services/profile";

const PREFERENCES = "learning_pair_preferences";
const PAIRS = "learning_pairs";
const MESSAGES = "messages";
const PAIR_DAYS = 7;

function db() {
  return getFirebaseAdminFirestore();
}

export interface PairPreference {
  lookingForPartner: boolean;
  cohortId: string;
  updatedAt: string;
}

export interface LearningPair {
  id: string;
  userA: string;
  userB: string;
  moduleId: string;
  cohortId: string;
  courseId: string;
  status: "active" | "completed" | "expired";
  createdAt: string;
  completedAt?: string | null;
  expiresAt?: string | null;
}

export interface PairMessage {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

export async function getPreference(uid: string): Promise<PairPreference | null> {
  const snap = await db().collection(PREFERENCES).doc(uid).get();
  if (!snap.exists) return null;
  const d = snap.data()!;
  return {
    lookingForPartner: (d.lookingForPartner as boolean) ?? false,
    cohortId: (d.cohortId as string) ?? "",
    updatedAt: (d.updatedAt as string) ?? "",
  };
}

export async function setLookingForPartner(uid: string, cohortId: string, value: boolean): Promise<void> {
  const ref = db().collection(PREFERENCES).doc(uid);
  const now = new Date().toISOString();
  await ref.set({ lookingForPartner: value, cohortId, updatedAt: now }, { merge: true });
  if (!value) return;
  // If turning on, try to match immediately
  await tryMatch(uid);
}

async function tryMatch(uid: string): Promise<LearningPair | null> {
  const enrollment = await firebaseContent.getActiveEnrollmentForUser(uid);
  if (!enrollment) return null;
  const cohortId = enrollment.cohort_id;
  const courseId = await firebaseContent.getPrimaryCourseForCohort(cohortId);
  if (!courseId) return null;
  const pref = await getPreference(uid);
  if (!pref?.lookingForPartner) return null;
  const activePair = await getActivePairForUser(uid);
  if (activePair) return activePair;

  const myProfile = await profileService.getProfile(uid);
  const myInstitution = (myProfile?.institution ?? "").trim().toLowerCase();
  const myPosition = (myProfile?.position ?? "").trim().toLowerCase();
  const myProgress = await firebaseProgress.getProgress(uid, courseId);
  const modules = await firebaseContent.getPublishedModules(courseId);
  let moduleId: string | null = null;
  for (const m of modules) {
    const lessons = await firebaseContent.getLessons(m.id);
    const lessonIds = lessons.map((l) => (l as { id: string }).id);
    const allDone = lessonIds.length > 0 && lessonIds.every((lid) => myProgress.completedLessonIds.includes(lid));
    if (!allDone) {
      moduleId = m.id;
      break;
    }
  }
  if (!moduleId && modules.length > 0) moduleId = modules[0].id;
  if (!moduleId) return null;
  const assignModuleId = moduleId;

  const candidateIds = await firebaseContent.listActiveEnrollmentUserIdsInCohort(cohortId);
  const others = candidateIds.filter((id) => id !== uid);
  for (const otherId of others) {
    const otherPref = await getPreference(otherId);
    if (!otherPref?.lookingForPartner || otherPref.cohortId !== cohortId) continue;
    const otherPair = await getActivePairForUser(otherId);
    if (otherPair) continue;
    const otherProfile = await profileService.getProfile(otherId);
    const otherInstitution = (otherProfile?.institution ?? "").trim().toLowerCase();
    const otherPosition = (otherProfile?.position ?? "").trim().toLowerCase();
    if (myInstitution && otherInstitution && myInstitution === otherInstitution) continue;
    if (myPosition && otherPosition && myPosition === otherPosition) continue;
    return await createPair(uid, otherId, cohortId, courseId, assignModuleId);
  }
  return null;
}

async function createPair(
  userA: string,
  userB: string,
  cohortId: string,
  courseId: string,
  moduleId: string
): Promise<LearningPair> {
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + PAIR_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const ref = db().collection(PAIRS).doc();
  await ref.set({
    userA,
    userB,
    moduleId,
    cohortId,
    courseId,
    status: "active",
    createdAt: now,
    expiresAt,
  });
  await db().collection(PREFERENCES).doc(userA).update({ lookingForPartner: false });
  await db().collection(PREFERENCES).doc(userB).update({ lookingForPartner: false });
  const snap = await ref.get();
  const d = snap.data()!;
  return {
    id: snap.id,
    userA: d.userA as string,
    userB: d.userB as string,
    moduleId: d.moduleId as string,
    cohortId: d.cohortId as string,
    courseId: d.courseId as string,
    status: (d.status as LearningPair["status"]) ?? "active",
    createdAt: (d.createdAt as string) ?? now,
    completedAt: (d.completedAt as string) ?? null,
    expiresAt: (d.expiresAt as string) ?? null,
  };
}

export async function getActivePairForUser(uid: string): Promise<LearningPair | null> {
  const snap = await db()
    .collection(PAIRS)
    .where("userA", "==", uid)
    .where("status", "==", "active")
    .limit(1)
    .get();
  if (!snap.empty) {
    const d = snap.docs[0].data();
    const expiresAt = d.expiresAt as string | undefined;
    if (expiresAt && new Date(expiresAt) < new Date()) {
      await snap.docs[0].ref.update({ status: "expired" });
      return null;
    }
    return docToPair(snap.docs[0]);
  }
  const snapB = await db()
    .collection(PAIRS)
    .where("userB", "==", uid)
    .where("status", "==", "active")
    .limit(1)
    .get();
  if (!snapB.empty) {
    const doc = snapB.docs[0];
    const d = doc.data();
    const expiresAt = d.expiresAt as string | undefined;
    if (expiresAt && new Date(expiresAt) < new Date()) {
      await doc.ref.update({ status: "expired" });
      return null;
    }
    return docToPair(doc);
  }
  return null;
}

function docToPair(doc: { id: string; data: () => Record<string, unknown> }): LearningPair {
  const d = doc.data()!;
  return {
    id: doc.id,
    userA: d.userA as string,
    userB: d.userB as string,
    moduleId: d.moduleId as string,
    cohortId: d.cohortId as string,
    courseId: d.courseId as string,
    status: (d.status as LearningPair["status"]) ?? "active",
    createdAt: (d.createdAt as string) ?? "",
    completedAt: (d.completedAt as string) ?? null,
    expiresAt: (d.expiresAt as string) ?? null,
  };
}

export async function getPair(pairId: string, uid: string): Promise<LearningPair | null> {
  const snap = await db().collection(PAIRS).doc(pairId).get();
  if (!snap.exists) return null;
  const pair = docToPair({
      id: snap.id,
      data: () => (snap.data() ?? {}) as Record<string, unknown>,
    });
  if (pair.userA !== uid && pair.userB !== uid) return null;
  return pair;
}

export async function listMessages(pairId: string, limit = 100): Promise<PairMessage[]> {
  const snap = await db()
    .collection(PAIRS)
    .doc(pairId)
    .collection(MESSAGES)
    .orderBy("createdAt", "asc")
    .limit(limit)
    .get();
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      userId: (data.userId as string) ?? "",
      text: (data.text as string) ?? "",
      createdAt: (data.createdAt as string) ?? "",
    };
  });
}

export async function addMessage(pairId: string, userId: string, text: string): Promise<PairMessage> {
  const pair = await db().collection(PAIRS).doc(pairId).get();
  if (!pair.exists) throw new Error("Par no encontrado");
  const data = pair.data()!;
  if (data.userA !== userId && data.userB !== userId) throw new Error("No eres miembro del par");
  const trimmed = text.trim().slice(0, 2000);
  if (!trimmed) throw new Error("Mensaje vacío");
  const ref = db().collection(PAIRS).doc(pairId).collection(MESSAGES).doc();
  const now = new Date().toISOString();
  await ref.set({ userId, text: trimmed, createdAt: now });
  const snap = await ref.get();
  const d = snap.data()!;
  return {
    id: snap.id,
    userId: (d.userId as string) ?? userId,
    text: (d.text as string) ?? "",
    createdAt: (d.createdAt as string) ?? now,
  };
}

export async function completePair(pairId: string, uid: string): Promise<LearningPair | null> {
  const pair = await getPair(pairId, uid);
  if (!pair || pair.status !== "active") return null;
  const now = new Date().toISOString();
  await db().collection(PAIRS).doc(pairId).update({ status: "completed", completedAt: now });
  await profileService.setBadge(pair.userA, "learning_team");
  await profileService.setBadge(pair.userB, "learning_team");
  return { ...pair, status: "completed" as const, completedAt: now };
}
/**
 * Talleres (Peer Review): entregas, asignación de pares, revisiones con rúbrica.
 * Firestore: workshops, workshops/{id}/submissions, assignments, reviews.
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

const WORKSHOPS = "workshops";
const SUBMISSIONS = "submissions";
const ASSIGNMENTS = "assignments";
const REVIEWS = "reviews";

export interface RubricCriterion {
  id: string;
  label: string;
  maxScore: number;
}

export interface Workshop {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  rubric: RubricCriterion[];
  deadline: string | null;
  reviewDeadline: string | null;
  peerCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkshopSubmission {
  userId: string;
  content: string;
  fileUrl: string | null;
  submittedAt: string;
}

export interface WorkshopAssignment {
  userId: string;
  reviewerOf: string[];
}

export interface WorkshopReview {
  reviewerId: string;
  reviewedId: string;
  scores: Record<string, number>;
  feedback: string;
  completedAt: string;
}

function db() {
  return getFirebaseAdminFirestore();
}

export async function listWorkshopsByModule(moduleId: string): Promise<Workshop[]> {
  const snap = await db().collection(WORKSHOPS).where("moduleId", "==", moduleId).get();
  return snap.docs.map((d) => {
    const x = d.data();
    return {
      id: d.id,
      moduleId: x.moduleId,
      title: x.title ?? "",
      description: x.description ?? "",
      rubric: Array.isArray(x.rubric) ? x.rubric : [],
      deadline: x.deadline ?? null,
      reviewDeadline: x.reviewDeadline ?? null,
      peerCount: x.peerCount ?? 2,
      createdAt: x.createdAt ?? "",
      updatedAt: x.updatedAt ?? "",
    } as Workshop;
  });
}

export async function getWorkshop(workshopId: string): Promise<Workshop | null> {
  const doc = await db().collection(WORKSHOPS).doc(workshopId).get();
  if (!doc.exists) return null;
  const x = doc.data()!;
  return {
    id: doc.id,
    moduleId: x.moduleId,
    title: x.title ?? "",
    description: x.description ?? "",
    rubric: Array.isArray(x.rubric) ? x.rubric : [],
    deadline: x.deadline ?? null,
    reviewDeadline: x.reviewDeadline ?? null,
    peerCount: x.peerCount ?? 2,
    createdAt: x.createdAt ?? "",
    updatedAt: x.updatedAt ?? "",
  } as Workshop;
}

export async function createWorkshop(data: {
  moduleId: string;
  title: string;
  description: string;
  rubric: RubricCriterion[];
  deadline: string | null;
  reviewDeadline: string | null;
  peerCount: number;
}): Promise<Workshop> {
  const now = new Date().toISOString();
  const ref = db().collection(WORKSHOPS).doc();
  await ref.set({
    moduleId: data.moduleId,
    title: data.title.trim(),
    description: data.description.trim(),
    rubric: data.rubric,
    deadline: data.deadline ?? null,
    reviewDeadline: data.reviewDeadline ?? null,
    peerCount: data.peerCount ?? 2,
    createdAt: now,
    updatedAt: now,
  });
  const snap = await ref.get();
  const x = snap.data()!;
  return {
    id: snap.id,
    moduleId: x.moduleId,
    title: x.title ?? "",
    description: x.description ?? "",
    rubric: Array.isArray(x.rubric) ? x.rubric : [],
    deadline: x.deadline ?? null,
    reviewDeadline: x.reviewDeadline ?? null,
    peerCount: x.peerCount ?? 2,
    createdAt: x.createdAt ?? "",
    updatedAt: x.updatedAt ?? "",
  } as Workshop;
}

export async function updateWorkshop(
  workshopId: string,
  data: Partial<{
    moduleId: string;
    title: string;
    description: string;
    rubric: RubricCriterion[];
    deadline: string | null;
    reviewDeadline: string | null;
    peerCount: number;
  }>
): Promise<Workshop | null> {
  const ref = db().collection(WORKSHOPS).doc(workshopId);
  const clean: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (data.moduleId !== undefined) clean.moduleId = data.moduleId;
  if (data.title !== undefined) clean.title = data.title.trim();
  if (data.description !== undefined) clean.description = data.description.trim();
  if (data.rubric !== undefined) clean.rubric = data.rubric;
  if (data.deadline !== undefined) clean.deadline = data.deadline;
  if (data.reviewDeadline !== undefined) clean.reviewDeadline = data.reviewDeadline;
  if (data.peerCount !== undefined) clean.peerCount = data.peerCount;
  await ref.update(clean);
  return getWorkshop(workshopId);
}

export async function getSubmission(workshopId: string, userId: string): Promise<WorkshopSubmission | null> {
  const doc = await db().collection(WORKSHOPS).doc(workshopId).collection(SUBMISSIONS).doc(userId).get();
  if (!doc.exists) return null;
  const x = doc.data()!;
  return {
    userId,
    content: x.content ?? "",
    fileUrl: x.fileUrl ?? null,
    submittedAt: x.submittedAt ?? "",
  };
}

export async function setSubmission(workshopId: string, userId: string, data: { content: string; fileUrl?: string | null }): Promise<void> {
  const ref = db().collection(WORKSHOPS).doc(workshopId).collection(SUBMISSIONS).doc(userId);
  await ref.set({
    content: data.content,
    fileUrl: data.fileUrl ?? null,
    submittedAt: new Date().toISOString(),
  });
}

/** Lista los userId que ya entregaron (para asignar pares). */
export async function getSubmissionUserIds(workshopId: string): Promise<string[]> {
  const snap = await db().collection(WORKSHOPS).doc(workshopId).collection(SUBMISSIONS).get();
  return snap.docs.map((d) => d.id);
}

export async function getAssignment(workshopId: string, userId: string): Promise<WorkshopAssignment | null> {
  const doc = await db().collection(WORKSHOPS).doc(workshopId).collection(ASSIGNMENTS).doc(userId).get();
  if (!doc.exists) return null;
  const x = doc.data()!;
  return { userId, reviewerOf: Array.isArray(x.reviewerOf) ? x.reviewerOf : [] };
}

export async function assignPeers(workshopId: string, submittedUserIds: string[], peerCount: number): Promise<void> {
  const batch = db().batch();
  const shuffled = [...submittedUserIds].sort(() => Math.random() - 0.5);
  for (let i = 0; i < shuffled.length; i++) {
    const reviewerId = shuffled[i];
    const toReview: string[] = [];
    for (let k = 1; k <= peerCount; k++) {
      const idx = (i + k) % shuffled.length;
      if (shuffled[idx] !== reviewerId) toReview.push(shuffled[idx]);
    }
    const ref = db().collection(WORKSHOPS).doc(workshopId).collection(ASSIGNMENTS).doc(reviewerId);
    batch.set(ref, { userId: reviewerId, reviewerOf: toReview });
  }
  await batch.commit();
}

export async function getReview(workshopId: string, reviewerId: string, reviewedId: string): Promise<WorkshopReview | null> {
  const docId = `${reviewerId}_${reviewedId}`;
  const doc = await db().collection(WORKSHOPS).doc(workshopId).collection(REVIEWS).doc(docId).get();
  if (!doc.exists) return null;
  const x = doc.data()!;
  return {
    reviewerId: x.reviewerId,
    reviewedId: x.reviewedId,
    scores: (x.scores as Record<string, number>) ?? {},
    feedback: x.feedback ?? "",
    completedAt: x.completedAt ?? "",
  };
}

export async function setReview(workshopId: string, reviewerId: string, reviewedId: string, data: { scores: Record<string, number>; feedback: string }): Promise<void> {
  const docId = `${reviewerId}_${reviewedId}`;
  await db().collection(WORKSHOPS).doc(workshopId).collection(REVIEWS).doc(docId).set({
    reviewerId,
    reviewedId,
    scores: data.scores,
    feedback: data.feedback,
    completedAt: new Date().toISOString(),
  });
}

export async function getAverageScoreForUser(workshopId: string, userId: string): Promise<number | null> {
  const snap = await db().collection(WORKSHOPS).doc(workshopId).collection(REVIEWS).where("reviewedId", "==", userId).get();
  if (snap.empty) return null;
  let total = 0;
  let count = 0;
  snap.docs.forEach((d) => {
    const scores = d.data().scores as Record<string, number> | undefined;
    if (scores && typeof scores === "object") {
      const sum = Object.values(scores).reduce((a, b) => a + Number(b), 0);
      const max = Object.values(scores).length * 10;
      if (max > 0) { total += (sum / max) * 100; count++; }
    }
  });
  return count > 0 ? Math.round(total / count) : null;
}

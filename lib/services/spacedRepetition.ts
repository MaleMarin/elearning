/**
 * Repaso espaciado: programar repasos a 1, 7 y 30 días tras completar una lección.
 * Firestore: users/{userId}/spaced_reviews/{reviewId}
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { getDemoMode } from "@/lib/env";

const COLLECTION = "spaced_reviews";

export type SpacedReviewStatus = "pending" | "done" | "failed";

export interface SpacedReview {
  id: string;
  userId: string;
  lessonId: string;
  lessonTitle?: string;
  nextReviewDate: string; // ISO date
  status: SpacedReviewStatus;
  createdAt: string;
  completedAt?: string | null;
}

const REVIEW_DAYS = [1, 7, 30];

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Programa los 3 repasos (1, 7, 30 días) al completar una lección.
 */
export async function scheduleReviews(
  userId: string,
  lessonId: string,
  lessonTitle?: string | null
): Promise<void> {
  if (getDemoMode()) return;
  const db = getFirebaseAdminFirestore();
  const now = new Date().toISOString();
  const baseDate = now.slice(0, 10);

  for (const days of REVIEW_DAYS) {
    const ref = db.collection("users").doc(userId).collection(COLLECTION).doc();
    await ref.set({
      lessonId,
      lessonTitle: lessonTitle ?? null,
      nextReviewDate: addDays(baseDate, days),
      status: "pending",
      createdAt: now,
    });
  }
}

/**
 * Lista repasos pendientes del usuario (nextReviewDate <= hoy, status pending).
 */
export async function getPendingReviews(userId: string): Promise<SpacedReview[]> {
  if (getDemoMode()) return [];
  try {
    const db = getFirebaseAdminFirestore();
    const today = new Date().toISOString().slice(0, 10);
    const snap = await db
      .collection("users")
      .doc(userId)
      .collection(COLLECTION)
      .where("status", "==", "pending")
      .get();
    const list = snap.docs.map((d) => ({ id: d.id, userId, ...d.data() } as SpacedReview));
    return list.filter((r) => r.nextReviewDate <= today).sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate)).slice(0, 10);
  } catch {
    return [];
  }
}

/**
 * Máximo 3 preguntas por sesión: devuelve hasta 3 repasos pendientes.
 */
export async function getPendingReviewsForSession(userId: string): Promise<SpacedReview[]> {
  const list = await getPendingReviews(userId);
  return list.slice(0, 3);
}

/**
 * Marca un repaso como completado (dominado).
 */
export async function markReviewDone(userId: string, reviewId: string): Promise<void> {
  if (getDemoMode()) return;
  const db = getFirebaseAdminFirestore();
  const ref = db.collection("users").doc(userId).collection(COLLECTION).doc(reviewId);
  await ref.update({ status: "done", completedAt: new Date().toISOString() });
}

/**
 * Marca como fallido y reagenda en 3 días.
 */
export async function markReviewFailed(userId: string, reviewId: string): Promise<void> {
  if (getDemoMode()) return;
  const db = getFirebaseAdminFirestore();
  const ref = db.collection("users").doc(userId).collection(COLLECTION).doc(reviewId);
  const snap = await ref.get();
  if (!snap.exists) return;
  const data = snap.data() as { nextReviewDate?: string };
  const next = data?.nextReviewDate
    ? addDays(new Date(data.nextReviewDate).toISOString().slice(0, 10), 3)
    : addDays(new Date().toISOString().slice(0, 10), 3);
  await ref.update({ status: "failed", nextReviewDate: next });
  // Reabrir para próxima vez: crear nuevo doc pending con nextReviewDate en 3 días, o reutilizar
  await ref.update({ status: "pending", nextReviewDate: next });
}

/**
 * Cron: lista todos los usuarios con repasos pendientes (nextReviewDate <= hoy).
 * Útil para enviar notificaciones o marcar "tiene repaso pendiente".
 */
export async function getUsersWithPendingReviews(): Promise<{ userId: string; count: number }[]> {
  if (getDemoMode()) return [];
  const db = getFirebaseAdminFirestore();
  const today = new Date().toISOString().slice(0, 10);
  const usersRef = db.collection("users");
  const snap = await usersRef.get();
  const result: { userId: string; count: number }[] = [];
  for (const userDoc of snap.docs) {
    const reviewsSnap = await userDoc.ref
      .collection(COLLECTION)
      .where("status", "==", "pending")
      .get();
    const pending = reviewsSnap.docs.filter((d) => (d.data().nextReviewDate as string) <= today);
    if (pending.length > 0) {
      result.push({ userId: userDoc.id, count: pending.length });
    }
  }
  return result;
}

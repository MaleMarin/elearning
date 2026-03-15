/**
 * Repetición espaciada por concepto — intervalos 3, 7, 14, 30, 90 días.
 * Firestore: users/{userId}/spaced_repetition/{conceptId}
 */
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

const INTERVALS = [3, 7, 14, 30, 90]; // días

export interface SpacedRepItem {
  userId: string;
  conceptId: string;
  conceptTitle: string;
  moduleId: string;
  lessonId: string;
  lastReview: Date;
  nextReview: Date;
  interval: number;
  strength: number;
}

function db() {
  return getFirebaseAdminFirestore();
}

export async function scheduleReview(
  userId: string,
  conceptId: string,
  conceptTitle: string,
  moduleId: string,
  lessonId: string
): Promise<void> {
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + INTERVALS[0]);

  await db()
    .collection("users")
    .doc(userId)
    .collection("spaced_repetition")
    .doc(conceptId)
    .set({
      conceptId,
      conceptTitle,
      moduleId,
      lessonId,
      lastReview: FieldValue.serverTimestamp(),
      nextReview: nextReviewDate,
      intervalIndex: 0,
      strength: 0,
    });
}

export async function getDueReviews(userId: string): Promise<SpacedRepItem[]> {
  const now = new Date();
  const snap = await db()
    .collection("users")
    .doc(userId)
    .collection("spaced_repetition")
    .where("nextReview", "<=", now)
    .orderBy("nextReview", "asc")
    .limit(5)
    .get();

  return snap.docs.map((d) => {
    const data = d.data();
    const next = data.nextReview as { toDate?: () => Date } | Date;
    const last = data.lastReview as { toDate?: () => Date } | Date;
    return {
      userId,
      conceptId: data.conceptId as string,
      conceptTitle: data.conceptTitle as string,
      moduleId: data.moduleId as string,
      lessonId: data.lessonId as string,
      lastReview: last && typeof (last as { toDate?: () => Date }).toDate === "function" ? (last as { toDate: () => Date }).toDate() : new Date(last as Date),
      nextReview: next && typeof (next as { toDate?: () => Date }).toDate === "function" ? (next as { toDate: () => Date }).toDate() : new Date(next as Date),
      interval: (data.intervalIndex as number) ?? 0,
      strength: (data.strength as number) ?? 0,
    };
  });
}

export async function updateAfterReview(
  userId: string,
  conceptId: string,
  remembered: boolean
): Promise<void> {
  const ref = db()
    .collection("users")
    .doc(userId)
    .collection("spaced_repetition")
    .doc(conceptId);
  const doc = await ref.get();
  if (!doc.exists) return;

  const data = doc.data()!;
  const currentIndex = (data.intervalIndex as number) || 0;
  const newIndex = remembered
    ? Math.min(currentIndex + 1, INTERVALS.length - 1)
    : Math.max(0, currentIndex - 1);

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + INTERVALS[newIndex]);

  await ref.update({
    intervalIndex: newIndex,
    lastReview: FieldValue.serverTimestamp(),
    nextReview: nextDate,
    strength: remembered ? Math.min(((data.strength as number) || 0) + 1, 5) : 0,
  });
}

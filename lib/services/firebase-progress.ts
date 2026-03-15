/**
 * Progreso de lecciones por usuario y curso en Firestore.
 * Colección: progress. Document ID: {uid}_{courseId}.
 * @see docs/CURSOR_RULES.md — Ticket 3.
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

const db = () => getFirebaseAdminFirestore();

const COLLECTION = "progress";

function docId(uid: string, courseId: string): string {
  return `${uid}_${courseId}`;
}

/**
 * Obtiene el progreso del usuario para un curso. Si no existe, devuelve null (sin completadas).
 */
export async function getProgress(
  uid: string,
  courseId: string
): Promise<{ completedLessonIds: string[] }> {
  const ref = db().collection(COLLECTION).doc(docId(uid, courseId));
  const snap = await ref.get();
  if (!snap.exists) {
    return { completedLessonIds: [] };
  }
  const data = snap.data() as { completedLessonIds?: string[] } | undefined;
  const list = Array.isArray(data?.completedLessonIds) ? data.completedLessonIds : [];
  return { completedLessonIds: list };
}

/**
 * Marca una lección como completada (idempotente). Crea el doc si no existe.
 */
export async function addCompletedLesson(
  uid: string,
  courseId: string,
  lessonId: string
): Promise<{ completedLessonIds: string[] }> {
  const id = docId(uid, courseId);
  const ref = db().collection(COLLECTION).doc(id);
  const now = new Date();

  const updated = await db().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const existing = (snap.data() as { completedLessonIds?: string[] } | undefined)?.completedLessonIds;
    const list = Array.isArray(existing) ? [...existing] : [];
    if (!list.includes(lessonId)) {
      list.push(lessonId);
    }
    const payload = {
      uid,
      courseId,
      completedLessonIds: list,
      updatedAt: now,
    };
    tx.set(ref, payload);
    return list;
  });

  return { completedLessonIds: updated };
}

/**
 * Quita una lección de completadas (idempotente). Opcional para "Marcar como pendiente".
 */
export async function removeCompletedLesson(
  uid: string,
  courseId: string,
  lessonId: string
): Promise<{ completedLessonIds: string[] }> {
  const id = docId(uid, courseId);
  const ref = db().collection(COLLECTION).doc(id);

  const updated = await db().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const existing = (snap.data() as { completedLessonIds?: string[] } | undefined)?.completedLessonIds;
    const list = Array.isArray(existing) ? existing.filter((id) => id !== lessonId) : [];
    const payload = {
      uid,
      courseId,
      completedLessonIds: list,
      updatedAt: new Date(),
    };
    tx.set(ref, payload);
    return list;
  });

  return { completedLessonIds: updated };
}

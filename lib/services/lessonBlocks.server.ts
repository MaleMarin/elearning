/**
 * Lógica de lesson blocks que usa Firestore. Solo importar en API routes o Server Components.
 * No importar en Client Components (evita que firebase-admin llegue al bundle del cliente).
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import type { LessonBlock } from "@/lib/services/lessonBlocks";

const CHECKLIST_COLLECTION = "lesson_checklist";

export interface LessonChecklistState {
  [blockId: string]: { [itemId: string]: boolean };
}

/** Lee bloques de una lección desde Firestore. */
export async function getLessonBlocks(lessonId: string): Promise<LessonBlock[]> {
  try {
    const db = getFirebaseAdminFirestore();
    const doc = await db.collection("lessons").doc(lessonId).get();
    if (!doc.exists) return [];
    const data = doc.data() as { blocks?: LessonBlock[] };
    return Array.isArray(data?.blocks) ? data.blocks : [];
  } catch {
    return [];
  }
}

/** Guarda los bloques de una lección en Firestore. */
export async function saveLessonBlocks(lessonId: string, blocks: LessonBlock[]): Promise<void> {
  const db = getFirebaseAdminFirestore();
  await db.collection("lessons").doc(lessonId).update({
    blocks,
    updated_at: new Date().toISOString(),
  });
}

/** Obtiene el estado de checklists de un alumno para una lección. */
export async function getLessonChecklistState(
  userId: string,
  lessonId: string
): Promise<LessonChecklistState> {
  try {
    const db = getFirebaseAdminFirestore();
    const doc = await db
      .collection("users")
      .doc(userId)
      .collection(CHECKLIST_COLLECTION)
      .doc(lessonId)
      .get();
    if (!doc.exists) return {};
    return (doc.data()?.state as LessonChecklistState) ?? {};
  } catch {
    return {};
  }
}

/** Actualiza el estado de un ítem de checklist (marcar/desmarcar). */
export async function setChecklistItemChecked(
  userId: string,
  lessonId: string,
  blockId: string,
  itemId: string,
  checked: boolean
): Promise<void> {
  try {
    const db = getFirebaseAdminFirestore();
    const ref = db.collection("users").doc(userId).collection(CHECKLIST_COLLECTION).doc(lessonId);
    const snap = await ref.get();
    const current = (snap.data()?.state as LessonChecklistState) ?? {};
    const blockState = current[blockId] ?? {};
    const next = {
      ...current,
      [blockId]: { ...blockState, [itemId]: checked },
    };
    await ref.set({ state: next, updatedAt: new Date().toISOString() }, { merge: true });
  } catch {
    // Modo demo o sin Firebase
  }
}

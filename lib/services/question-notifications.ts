/**
 * Notificaciones in-app: "alguien respondió tu pregunta".
 * Firestore: question_notifications/{id}
 *   userId, type: "answer_to_question", lessonId, postId, fromUserName, read, createdAt
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

const COLLECTION = "question_notifications";

function db() {
  return getFirebaseAdminFirestore();
}

export interface QuestionNotification {
  id: string;
  userId: string;
  type: "answer_to_question";
  lessonId: string;
  postId: string;
  fromUserName: string;
  read: boolean;
  createdAt: string;
}

export async function createAnswerNotification(
  recipientUserId: string,
  lessonId: string,
  postId: string,
  fromUserName: string
): Promise<void> {
  if (!recipientUserId) return;
  const ref = db().collection(COLLECTION).doc();
  await ref.set({
    userId: recipientUserId,
    type: "answer_to_question",
    lessonId,
    postId,
    fromUserName: fromUserName?.trim() || "Alumno",
    read: false,
    createdAt: new Date().toISOString(),
  });
}

export async function listByUser(userId: string, options?: { lessonId?: string; unreadOnly?: boolean }): Promise<QuestionNotification[]> {
  const snap = await db()
    .collection(COLLECTION)
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .limit(100)
    .get();
  let list = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      userId: (data.userId as string) ?? "",
      type: (data.type as QuestionNotification["type"]) ?? "answer_to_question",
      lessonId: (data.lessonId as string) ?? "",
      postId: (data.postId as string) ?? "",
      fromUserName: (data.fromUserName as string) ?? "Alumno",
      read: (data.read as boolean) ?? false,
      createdAt: (data.createdAt as string) ?? "",
    };
  });
  if (options?.lessonId) list = list.filter((n) => n.lessonId === options.lessonId);
  if (options?.unreadOnly) list = list.filter((n) => !n.read);
  return list;
}

export async function markAsRead(notificationId: string, userId: string): Promise<boolean> {
  const ref = db().collection(COLLECTION).doc(notificationId);
  const doc = await ref.get();
  if (!doc.exists || (doc.data()?.userId as string) !== userId) return false;
  await ref.update({ read: true });
  return true;
}

export async function markAllReadForLesson(userId: string, lessonId: string): Promise<void> {
  const list = await listByUser(userId, { lessonId, unreadOnly: true });
  if (list.length === 0) return;
  const batch = db().batch();
  list.forEach((n) => batch.update(db().collection(COLLECTION).doc(n.id), { read: true }));
  await batch.commit();
}

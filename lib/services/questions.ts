/**
 * Preguntas públicas por lección (Stack Overflow-style).
 * Firestore: /questions/{lessonId}/posts/{postId}
 *   - userId, userName, question, createdAt, votes, votadoPor[], resuelta
 * Subcollection: .../posts/{postId}/answers/{answerId}
 *   - userId, userName, answer, isOfficial (esRespuestaOficial), createdAt, votes
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export interface QuestionPost {
  id: string;
  userId: string;
  userName: string;
  question: string;
  createdAt: string;
  votes: number;
  votadoPor: string[];
  resuelta: boolean;
}

export interface QuestionAnswer {
  id: string;
  userId: string;
  userName: string;
  answer: string;
  isOfficial: boolean;
  createdAt: string;
  votes: number;
}

const COLLECTION = "questions";

function db() {
  return getFirebaseAdminFirestore();
}

function postsRef(lessonId: string) {
  return db().collection(COLLECTION).doc(lessonId).collection("posts");
}

export async function listPosts(
  lessonId: string,
  order: "recent" | "votes" = "recent"
): Promise<QuestionPost[]> {
  try {
    const ref = postsRef(lessonId);
    const snap =
      order === "votes"
        ? await ref.orderBy("votes", "desc").orderBy("createdAt", "desc").get()
        : await ref.orderBy("createdAt", "desc").get();
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: (data.userId as string) ?? "",
        userName: (data.userName as string) ?? "Alumno",
        question: (data.question as string) ?? "",
        createdAt: (data.createdAt as string) ?? "",
        votes: (data.votes as number) ?? 0,
        votadoPor: Array.isArray(data.votadoPor) ? (data.votadoPor as string[]) : [],
        resuelta: (data.resuelta as boolean) ?? false,
      };
    });
  } catch {
    return [];
  }
}

export async function createPost(
  lessonId: string,
  userId: string,
  userName: string,
  question: string
): Promise<QuestionPost> {
  const ref = postsRef(lessonId).doc();
  const now = new Date().toISOString();
  await ref.set({
    userId,
    userName: userName.trim() || "Alumno",
    question: question.trim(),
    createdAt: now,
    votes: 0,
    votadoPor: [],
    resuelta: false,
  });
  const snap = await ref.get();
  const data = snap.data()!;
  return {
    id: snap.id,
    userId: (data.userId as string) ?? userId,
    userName: (data.userName as string) ?? "Alumno",
    question: (data.question as string) ?? "",
    createdAt: (data.createdAt as string) ?? now,
    votes: (data.votes as number) ?? 0,
    votadoPor: Array.isArray(data.votadoPor) ? (data.votadoPor as string[]) : [],
    resuelta: (data.resuelta as boolean) ?? false,
  };
}

export async function getPost(lessonId: string, postId: string): Promise<QuestionPost | null> {
  try {
    const doc = await postsRef(lessonId).doc(postId).get();
    if (!doc.exists) return null;
    const data = doc.data()!;
    return {
      id: doc.id,
      userId: (data.userId as string) ?? "",
      userName: (data.userName as string) ?? "Alumno",
      question: (data.question as string) ?? "",
      createdAt: (data.createdAt as string) ?? "",
      votes: (data.votes as number) ?? 0,
      votadoPor: Array.isArray(data.votadoPor) ? (data.votadoPor as string[]) : [],
      resuelta: (data.resuelta as boolean) ?? false,
    };
  } catch {
    return null;
  }
}

export async function markResolved(
  lessonId: string,
  postId: string,
  resolved: boolean
): Promise<void> {
  const ref = postsRef(lessonId).doc(postId);
  await ref.update({ resuelta: resolved });
}

export async function listAnswers(lessonId: string, postId: string): Promise<QuestionAnswer[]> {
  try {
    const snap = await postsRef(lessonId)
      .doc(postId)
      .collection("answers")
      .orderBy("isOfficial", "desc")
      .orderBy("votes", "desc")
      .orderBy("createdAt", "asc")
      .get();
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: (data.userId as string) ?? "",
        userName: (data.userName as string) ?? "Alumno",
        answer: (data.answer as string) ?? "",
        isOfficial: (data.isOfficial as boolean) ?? false,
        createdAt: (data.createdAt as string) ?? "",
        votes: (data.votes as number) ?? 0,
      };
    });
  } catch {
    return [];
  }
}

export async function createAnswer(
  lessonId: string,
  postId: string,
  userId: string,
  userName: string,
  answer: string
): Promise<QuestionAnswer> {
  const ref = postsRef(lessonId).doc(postId).collection("answers").doc();
  const now = new Date().toISOString();
  await ref.set({
    userId,
    userName: userName.trim() || "Alumno",
    answer: answer.trim(),
    isOfficial: false,
    createdAt: now,
    votes: 0,
  });
  const snap = await ref.get();
  const data = snap.data()!;
  return {
    id: snap.id,
    userId: (data.userId as string) ?? userId,
    userName: (data.userName as string) ?? "Alumno",
    answer: (data.answer as string) ?? "",
    isOfficial: false,
    createdAt: (data.createdAt as string) ?? now,
    votes: 0,
  };
}

export async function setAnswerOfficial(
  lessonId: string,
  postId: string,
  answerId: string,
  isOfficial: boolean
): Promise<void> {
  const batch = db().batch();
  const answersRef = postsRef(lessonId).doc(postId).collection("answers");
  const all = await answersRef.get();
  all.docs.forEach((d) => {
    batch.update(d.ref, { isOfficial: d.id === answerId ? isOfficial : false });
  });
  await batch.commit();
}

/** Un voto por usuario: si delta=1 añade userId a votadoPor; si delta=-1 quita. */
export async function votePost(
  lessonId: string,
  postId: string,
  userId: string,
  delta: 1 | -1
): Promise<{ voted: boolean }> {
  const ref = postsRef(lessonId).doc(postId);
  const doc = await ref.get();
  if (!doc.exists) return { voted: false };
  const data = doc.data()!;
  const votadoPor = Array.isArray(data.votadoPor) ? [...(data.votadoPor as string[])] : [];
  const hasVoted = votadoPor.includes(userId);
  if (delta === 1 && hasVoted) return { voted: true };
  if (delta === -1 && !hasVoted) return { voted: false };
  if (delta === 1) votadoPor.push(userId);
  else votadoPor.splice(votadoPor.indexOf(userId), 1);
  const votes = Math.max(0, ((data.votes as number) ?? 0) + delta);
  await ref.update({ votes, votadoPor });
  return { voted: delta === 1 };
}

export async function voteAnswer(
  lessonId: string,
  postId: string,
  answerId: string,
  delta: 1 | -1
): Promise<void> {
  const ref = postsRef(lessonId).doc(postId).collection("answers").doc(answerId);
  const doc = await ref.get();
  if (!doc.exists) return;
  const votes = ((doc.data()?.votes as number) ?? 0) + delta;
  await ref.update({ votes: Math.max(0, votes) });
}

/** User vote tracking: users/{userId}/question_votes/{lessonId}_{postId} = true, same for answers */
export async function getUserPostVote(
  userId: string,
  lessonId: string,
  postId: string
): Promise<boolean> {
  const doc = await db()
    .collection("users")
    .doc(userId)
    .collection("question_votes")
    .doc(`${lessonId}_post_${postId}`)
    .get();
  return (doc.data()?.voted as boolean) ?? false;
}

export async function setUserPostVote(
  userId: string,
  lessonId: string,
  postId: string,
  voted: boolean
): Promise<void> {
  const ref = db().collection("users").doc(userId).collection("question_votes").doc(`${lessonId}_post_${postId}`);
  if (voted) await ref.set({ voted: true });
  else await ref.delete();
}

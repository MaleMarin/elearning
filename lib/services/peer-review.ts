/**
 * Peer review con rúbricas.
 * Firestore: activities/{actId}, submissions/{subId}, reviews/{revId}
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

const db = () => getFirebaseAdminFirestore();

export interface RubricaCriterio {
  criterio: string;
  peso: number;
  descripcion: string;
}

export interface Activity {
  id: string;
  tipo: "peer_review";
  rubrica: RubricaCriterio[];
  reviewsPorAlumno: number;
  lessonId: string;
}

export interface Submission {
  id: string;
  activityId: string;
  autorId: string;
  contenido: string;
  estado: "pending" | "in_review" | "reviewed";
  reviewers: string[];
}

export interface Review {
  id: string;
  submissionId: string;
  reviewerId: string;
  scores: Record<string, number>;
  comentario: string;
  calificacionFinal: number;
}

export async function createActivity(data: Omit<Activity, "id">): Promise<Activity> {
  const ref = await db().collection("activities").add({
    tipo: "peer_review",
    rubrica: data.rubrica,
    reviewsPorAlumno: data.reviewsPorAlumno ?? 2,
    lessonId: data.lessonId,
  });
  const snap = await ref.get();
  return { id: snap.id, ...snap.data() } as Activity;
}

export async function createSubmission(activityId: string, autorId: string, contenido: string): Promise<Submission> {
  const ref = await db().collection("submissions").add({
    activityId,
    autorId,
    contenido,
    estado: "pending",
    reviewers: [],
  });
  const snap = await ref.get();
  return { id: snap.id, ...snap.data() } as Submission;
}

export async function assignReviewers(submissionId: string, reviewerIds: string[]): Promise<void> {
  await db().collection("submissions").doc(submissionId).update({
    reviewers: reviewerIds,
    estado: "in_review",
  });
}

export async function createReview(
  submissionId: string,
  reviewerId: string,
  scores: Record<string, number>,
  comentario: string,
  calificacionFinal: number
): Promise<Review> {
  const ref = await db().collection("reviews").add({
    submissionId,
    reviewerId,
    scores,
    comentario,
    calificacionFinal,
  });
  const snap = await ref.get();
  return { id: snap.id, ...snap.data() } as Review;
}

/**
 * Glosario colaborativo por curso.
 * Firestore: /glossary/{courseId}/terms/{termId}
 *   - term, officialDefinition
 * Subcollection: .../terms/{termId}/proposals/{proposalId}
 *   - userId, definition, votes, createdAt
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export interface GlossaryTerm {
  id: string;
  term: string;
  officialDefinition: string;
  order?: number;
}

export interface GlossaryProposal {
  id: string;
  userId: string;
  definition: string;
  votes: number;
  createdAt: string;
}

const COLLECTION = "glossary";

function db() {
  return getFirebaseAdminFirestore();
}

function termsRef(courseId: string) {
  return db().collection(COLLECTION).doc(courseId).collection("terms");
}

export async function listTerms(courseId: string): Promise<GlossaryTerm[]> {
  try {
    const snap = await termsRef(courseId).orderBy("term", "asc").get();
    return snap.docs.map((d) => ({
      id: d.id,
      term: (d.data().term as string) ?? "",
      officialDefinition: (d.data().officialDefinition as string) ?? "",
      order: (d.data().order as number) ?? 0,
    }));
  } catch {
    return [];
  }
}

export async function getTerm(courseId: string, termId: string): Promise<GlossaryTerm | null> {
  const doc = await termsRef(courseId).doc(termId).get();
  if (!doc.exists) return null;
  const d = doc.data()!;
  return {
    id: doc.id,
    term: (d.term as string) ?? "",
    officialDefinition: (d.officialDefinition as string) ?? "",
    order: (d.order as number) ?? 0,
  };
}

export async function createTerm(
  courseId: string,
  term: string,
  officialDefinition: string,
  order?: number
): Promise<GlossaryTerm> {
  const ref = termsRef(courseId).doc();
  const now = new Date().toISOString();
  await ref.set({
    term: term.trim(),
    officialDefinition: officialDefinition.trim(),
    order: order ?? 0,
    createdAt: now,
    updatedAt: now,
  });
  const snap = await ref.get();
  const d = snap.data()!;
  return {
    id: snap.id,
    term: (d.term as string) ?? "",
    officialDefinition: (d.officialDefinition as string) ?? "",
    order: (d.order as number) ?? 0,
  };
}

export async function updateTerm(
  courseId: string,
  termId: string,
  updates: { term?: string; officialDefinition?: string; order?: number }
): Promise<void> {
  await termsRef(courseId).doc(termId).update({
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function listProposals(courseId: string, termId: string): Promise<GlossaryProposal[]> {
  try {
    const snap = await termsRef(courseId)
      .doc(termId)
      .collection("proposals")
      .orderBy("votes", "desc")
      .orderBy("createdAt", "desc")
      .get();
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: (data.userId as string) ?? "",
        definition: (data.definition as string) ?? "",
        votes: (data.votes as number) ?? 0,
        createdAt: (data.createdAt as string) ?? "",
      };
    });
  } catch {
    return [];
  }
}

export async function addProposal(
  courseId: string,
  termId: string,
  userId: string,
  definition: string
): Promise<GlossaryProposal> {
  const ref = termsRef(courseId).doc(termId).collection("proposals").doc();
  const now = new Date().toISOString();
  await ref.set({
    userId,
    definition: definition.trim(),
    votes: 0,
    createdAt: now,
  });
  const snap = await ref.get();
  const d = snap.data()!;
  return {
    id: snap.id,
    userId: (d.userId as string) ?? userId,
    definition: (d.definition as string) ?? "",
    votes: 0,
    createdAt: (d.createdAt as string) ?? now,
  };
}

/** Obtiene el ID de la propuesta más votada para un término (definición "oficial del grupo"). */
export async function getTopProposalId(courseId: string, termId: string): Promise<string | null> {
  const snap = await termsRef(courseId)
    .doc(termId)
    .collection("proposals")
    .orderBy("votes", "desc")
    .limit(1)
    .get();
  if (snap.empty) return null;
  return snap.docs[0].id;
}

/** Votar por una propuesta (incrementar votes). */
export async function voteProposal(
  courseId: string,
  termId: string,
  proposalId: string,
  delta: 1 | -1
): Promise<void> {
  const ref = termsRef(courseId).doc(termId).collection("proposals").doc(proposalId);
  const doc = await ref.get();
  if (!doc.exists) return;
  const current = (doc.data()?.votes as number) ?? 0;
  const next = Math.max(0, current + delta);
  await ref.update({ votes: next });
}

/** Obtener el voto del usuario para una propuesta (si guardamos votos por usuario). Opcional: users/{userId}/glossary_votes/{termId} = proposalId. */
export async function getUserVote(
  userId: string,
  courseId: string,
  termId: string
): Promise<string | null> {
  try {
    const doc = await db()
      .collection("users")
      .doc(userId)
      .collection("glossary_votes")
      .doc(termId)
      .get();
    return (doc.data()?.proposalId as string) ?? null;
  } catch {
    return null;
  }
}

export async function setUserVote(
  userId: string,
  courseId: string,
  termId: string,
  proposalId: string | null
): Promise<void> {
  const ref = db().collection("users").doc(userId).collection("glossary_votes").doc(termId);
  if (proposalId) {
    await ref.set({ proposalId, courseId, updatedAt: new Date().toISOString() }, { merge: true });
  } else {
    await ref.delete();
  }
}

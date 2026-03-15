/**
 * Propuestas de lecciones UGC — Firestore /lessonProposals/{id}.
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import type { PropuestaEstado, ContenidoGenerado } from "@/lib/types/lessonProposal";
import * as firebaseContent from "@/lib/services/firebase-content";

const COLLECTION = "lessonProposals";

function db() {
  return getFirebaseAdminFirestore();
}

export interface CreateProposalInput {
  autorId: string;
  autorNombre: string;
  autorInstitucion: string;
  titulo: string;
  descripcion: string;
  experienciaReal: string;
  moduleIdSugerido: string;
  estado?: PropuestaEstado;
  contenidoGenerado?: ContenidoGenerado | null;
}

export async function createProposal(input: CreateProposalInput) {
  const ref = db().collection(COLLECTION).doc();
  const now = new Date();
  const data = {
    autorId: input.autorId,
    autorNombre: input.autorNombre,
    autorInstitucion: input.autorInstitucion,
    titulo: input.titulo,
    descripcion: input.descripcion,
    experienciaReal: input.experienciaReal,
    moduleIdSugerido: input.moduleIdSugerido,
    estado: input.estado ?? "borrador",
    feedbackAdmin: "",
    contenidoGenerado: input.contenidoGenerado ?? null,
    createdAt: now,
    updatedAt: now,
  };
  await ref.set(data);
  return { id: ref.id, ...data } as Record<string, unknown>;
}

export async function getProposal(proposalId: string) {
  const doc = await db().collection(COLLECTION).doc(proposalId).get();
  if (!doc.exists) return null;
  const d = doc.data()!;
  return {
    id: doc.id,
    ...d,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  } as Record<string, unknown>;
}

export async function listProposalsByAuthor(autorId: string) {
  const snap = await db()
    .collection(COLLECTION)
    .where("autorId", "==", autorId)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Record<string, unknown>[];
}

export async function listProposalsForAdmin(filters?: { estado?: PropuestaEstado }) {
  const snap = await db()
    .collection(COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(200)
    .get();
  let list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Record<string, unknown>[];
  if (filters?.estado) {
    list = list.filter((p) => p.estado === filters.estado);
  }
  return list;
}

export async function updateProposal(
  proposalId: string,
  updates: Partial<{
    titulo: string;
    descripcion: string;
    experienciaReal: string;
    moduleIdSugerido: string;
    estado: PropuestaEstado;
    feedbackAdmin: string;
    contenidoGenerado: ContenidoGenerado | null;
  }>
) {
  const ref = db().collection(COLLECTION).doc(proposalId);
  await ref.update({
    ...updates,
    updatedAt: new Date(),
  });
  const snap = await ref.get();
  if (!snap.exists) throw new Error("Propuesta no encontrada");
  return { id: snap.id, ...snap.data() } as Record<string, unknown>;
}

/** Crea la lección en Firestore a partir de una propuesta aprobada (badge Comunidad). Devuelve la lección creada. */
export async function createLessonFromProposal(proposal: Record<string, unknown>): Promise<Record<string, unknown>> {
  const contenido = proposal.contenidoGenerado as ContenidoGenerado | null | undefined;
  if (!contenido?.objetivo) throw new Error("La propuesta no tiene contenido generado válido");
  const moduleId = proposal.moduleIdSugerido as string;
  const titulo = (proposal.titulo as string) || "Lección de la comunidad";
  const content = [contenido.introduccion, contenido.desarrollo, contenido.actividad]
    .filter(Boolean)
    .join("\n\n---\n\n");
  const lessons = await firebaseContent.getLessons(moduleId);
  const maxOrder = lessons.length > 0
    ? Math.max(...lessons.map((l) => (l.order_index as number) ?? 0))
    : -1;
  const order_index = maxOrder + 1;
  return firebaseContent.createLesson(moduleId, {
    title: titulo,
    summary: contenido.objetivo,
    content: content || contenido.objetivo,
    order_index,
    status: "published",
    source_community: true,
    proposal_id: proposal.id as string,
    community_author_id: (proposal.autorId as string) || null,
  });
}

/**
 * Retos de cohorte — Firestore cohorts/{cohortId}/challenges/{challengeId} (Brecha 8).
 */
import type { DocumentSnapshot } from "firebase-admin/firestore";
import { Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import type { CohortChallenge, Team, ChallengeEstado, EvaluationScore } from "@/lib/types/cohort-challenge";
import type { ChallengeMessage } from "@/lib/types/cohort-challenge";

const CHALLENGES = "challenges";
const TEAMS = "teams";
const MESSAGES = "messages";

function toIso(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  const d = v as { toDate?: () => Date };
  return d?.toDate?.()?.toISOString?.() ?? "";
}

function parseTeam(d: DocumentSnapshot, data: Record<string, unknown>): Team {
  return {
    id: d.id,
    nombre: String(data.nombre ?? ""),
    miembros: Array.isArray(data.miembros) ? data.miembros.map(String) : [],
    propuesta: String(data.propuesta ?? ""),
    submittedAt: data.submittedAt ? toIso(data.submittedAt) : null,
    scoresClaude: parseScores(data.scoresClaude),
  };
}

function parseScores(v: unknown): EvaluationScore | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const score = typeof o.score === "number" ? o.score : 0;
  const retroalimentacion = typeof o.retroalimentacion === "string" ? o.retroalimentacion : "";
  return { score, retroalimentacion, criterios: o.criterios as Record<string, number> | undefined };
}

export interface CreateChallengeInput {
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  criteriosEvaluacion: string[];
  premioDescripcion: string;
}

export async function createChallenge(cohortId: string, input: CreateChallengeInput): Promise<CohortChallenge> {
  const db = getFirebaseAdminFirestore();
  const ref = db.collection("cohorts").doc(cohortId).collection(CHALLENGES).doc();
  const now = Timestamp.now();
  const fechaInicio = Timestamp.fromDate(new Date(input.fechaInicio));
  const fechaFin = Timestamp.fromDate(new Date(input.fechaFin));
  await ref.set({
    titulo: input.titulo.trim(),
    descripcion: input.descripcion.trim(),
    fechaInicio,
    fechaFin,
    estado: "proximo",
    criteriosEvaluacion: Array.isArray(input.criteriosEvaluacion) ? input.criteriosEvaluacion : [],
    premioDescripcion: input.premioDescripcion.trim() || "Badge + mención en el certificado",
    ganador: null,
    createdAt: now,
  });
  const snap = await ref.get();
  return toChallenge(snap, cohortId);
}

function toChallenge(snap: DocumentSnapshot, cohortId: string): CohortChallenge {
  const data = snap.data();
  if (!data) throw new Error("Challenge not found");
  const equipos: Team[] = [];
  return {
    id: snap.id,
    cohortId,
    titulo: String(data.titulo ?? ""),
    descripcion: String(data.descripcion ?? ""),
    fechaInicio: toIso(data.fechaInicio),
    fechaFin: toIso(data.fechaFin),
    estado: (["proximo", "activo", "evaluando", "completado"].includes(String(data.estado)) ? data.estado : "proximo") as ChallengeEstado,
    criteriosEvaluacion: Array.isArray(data.criteriosEvaluacion) ? data.criteriosEvaluacion : [],
    premioDescripcion: String(data.premioDescripcion ?? ""),
    equipos,
    ganador: typeof data.ganador === "string" ? data.ganador : null,
    createdAt: toIso(data.createdAt),
  };
}

export async function getChallenge(cohortId: string, challengeId: string): Promise<CohortChallenge | null> {
  const db = getFirebaseAdminFirestore();
  const ref = db.collection("cohorts").doc(cohortId).collection(CHALLENGES).doc(challengeId);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const challenge = toChallenge(snap, cohortId);
  const teamsSnap = await ref.collection(TEAMS).get();
  challenge.equipos = teamsSnap.docs.map((d) => parseTeam(d, d.data()));
  return challenge;
}

export async function listChallengesByCohort(cohortId: string): Promise<CohortChallenge[]> {
  const db = getFirebaseAdminFirestore();
  const snap = await db.collection("cohorts").doc(cohortId).collection(CHALLENGES).orderBy("createdAt", "desc").get();
  const list: CohortChallenge[] = [];
  for (const d of snap.docs) {
    const c = toChallenge(d, cohortId);
    const teamsSnap = await d.ref.collection(TEAMS).get();
    c.equipos = teamsSnap.docs.map((t) => parseTeam(t, t.data()));
    list.push(c);
  }
  return list;
}

export async function updateChallengeEstado(cohortId: string, challengeId: string, estado: ChallengeEstado): Promise<void> {
  const db = getFirebaseAdminFirestore();
  await db.collection("cohorts").doc(cohortId).collection(CHALLENGES).doc(challengeId).update({ estado });
}

export async function setChallengeGanador(cohortId: string, challengeId: string, teamId: string | null): Promise<void> {
  const db = getFirebaseAdminFirestore();
  await db.collection("cohorts").doc(cohortId).collection(CHALLENGES).doc(challengeId).update({ ganador: teamId });
}

export async function createTeam(cohortId: string, challengeId: string, nombre: string, creadorUserId: string): Promise<Team> {
  const db = getFirebaseAdminFirestore();
  const challengeRef = db.collection("cohorts").doc(cohortId).collection(CHALLENGES).doc(challengeId);
  const teamRef = challengeRef.collection(TEAMS).doc();
  await teamRef.set({
    nombre: nombre.trim(),
    miembros: [creadorUserId],
    propuesta: "",
    submittedAt: null,
    scoresClaude: null,
  });
  const snap = await teamRef.get();
  return parseTeam(snap, snap.data() ?? {});
}

export async function joinTeam(cohortId: string, challengeId: string, teamId: string, userId: string): Promise<boolean> {
  const db = getFirebaseAdminFirestore();
  const ref = db.collection("cohorts").doc(cohortId).collection(CHALLENGES).doc(challengeId).collection(TEAMS).doc(teamId);
  const snap = await ref.get();
  if (!snap.exists) return false;
  const data = snap.data() ?? {};
  const miembros = Array.isArray(data.miembros) ? [...data.miembros] : [];
  if (miembros.includes(userId)) return true;
  miembros.push(userId);
  await ref.update({ miembros });
  return true;
}

export async function getTeam(cohortId: string, challengeId: string, teamId: string): Promise<Team | null> {
  const db = getFirebaseAdminFirestore();
  const snap = await db.collection("cohorts").doc(cohortId).collection(CHALLENGES).doc(challengeId).collection(TEAMS).doc(teamId).get();
  if (!snap.exists) return null;
  return parseTeam(snap, snap.data() ?? {});
}

export async function updateTeamPropuesta(cohortId: string, challengeId: string, teamId: string, propuesta: string): Promise<void> {
  const db = getFirebaseAdminFirestore();
  await db.collection("cohorts").doc(cohortId).collection(CHALLENGES).doc(challengeId).collection(TEAMS).doc(teamId).update({ propuesta });
}

export async function submitTeamPropuesta(cohortId: string, challengeId: string, teamId: string): Promise<void> {
  const db = getFirebaseAdminFirestore();
  await db.collection("cohorts").doc(cohortId).collection(CHALLENGES).doc(challengeId).collection(TEAMS).doc(teamId).update({
    submittedAt: Timestamp.now(),
  });
}

export async function setTeamScores(cohortId: string, challengeId: string, teamId: string, scores: EvaluationScore): Promise<void> {
  const db = getFirebaseAdminFirestore();
  await db.collection("cohorts").doc(cohortId).collection(CHALLENGES).doc(challengeId).collection(TEAMS).doc(teamId).update({
    scoresClaude: scores,
  });
}

export async function addTeamMessage(cohortId: string, challengeId: string, teamId: string, userId: string, userName: string, text: string): Promise<ChallengeMessage> {
  const db = getFirebaseAdminFirestore();
  const ref = db.collection("cohorts").doc(cohortId).collection(CHALLENGES).doc(challengeId).collection(TEAMS).doc(teamId).collection(MESSAGES).doc();
  const now = Timestamp.now();
  await ref.set({ userId, userName, text: text.trim(), createdAt: now });
  const snap = await ref.get();
  const data = snap.data() ?? {};
  return {
    id: snap.id,
    userId: String(data.userId),
    userName: String(data.userName ?? ""),
    text: String(data.text ?? ""),
    createdAt: toIso(data.createdAt),
  };
}

export async function getTeamMessages(cohortId: string, challengeId: string, teamId: string): Promise<ChallengeMessage[]> {
  const db = getFirebaseAdminFirestore();
  const snap = await db
    .collection("cohorts")
    .doc(cohortId)
    .collection(CHALLENGES)
    .doc(challengeId)
    .collection(TEAMS)
    .doc(teamId)
    .collection(MESSAGES)
    .orderBy("createdAt", "asc")
    .get();
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      userId: String(data.userId ?? ""),
      userName: String(data.userName ?? ""),
      text: String(data.text ?? ""),
      createdAt: toIso(data.createdAt),
    };
  });
}

/** Reto activo para una cohorte (estado === "activo"). */
export async function getActiveChallengeForCohort(cohortId: string): Promise<CohortChallenge | null> {
  const db = getFirebaseAdminFirestore();
  const snap = await db
    .collection("cohorts")
    .doc(cohortId)
    .collection(CHALLENGES)
    .where("estado", "==", "activo")
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return getChallenge(cohortId, doc.id);
}

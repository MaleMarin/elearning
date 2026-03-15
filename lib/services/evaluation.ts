/**
 * Evaluaciones: diagnóstico inicial, quiz final, encuesta de cierre.
 * Firestore: /users/{userId} (diagnosticCompleted, diagnostic), subcollections o docs.
 * Datos sensibles cifrados E2E (Brecha 1): diagnóstico y encuesta de cierre.
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { encrypt, decrypt } from "@/lib/crypto/encryption";

const USERS = "users";
const DIAGNOSTIC_DOC = "diagnostic";
const FINAL_QUIZ_DOC = "finalQuiz";
const CLOSING_SURVEY_DOC = "closingSurvey";

export interface DiagnosticAnswers {
  experience: string;
  motivation: string;
  challenges: string[];
  expectation?: string;
  availability: string;
}

export interface DiagnosticData {
  answers: DiagnosticAnswers;
  completedAt: string | null;
  skipped: boolean;
}

export interface FinalQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface FinalQuizResult {
  score: number;
  total: number;
  completedAt: string;
}

export interface ClosingSurveyData {
  methodology: number[]; // 3 items 1-5
  content: number[];     // 3 items 1-5
  platform: number[];    // 3 items 1-5
  nps: number;
  comment?: string;
  completedAt: string;
}

function db() {
  return getFirebaseAdminFirestore();
}

export async function getDiagnostic(uid: string): Promise<DiagnosticData | null> {
  const ref = db().collection(USERS).doc(uid).collection(DIAGNOSTIC_DOC).doc("v1");
  const snap = await ref.get();
  if (!snap.exists) return null;
  const d = snap.data() as Record<string, unknown>;
  const encryptedAnswers = d.encryptedAnswers as string | undefined;
  let answers: DiagnosticAnswers;
  if (encryptedAnswers) {
    try {
      const raw = decrypt(encryptedAnswers, uid);
      answers = raw ? (JSON.parse(raw) as DiagnosticAnswers) : (d.answers as DiagnosticAnswers) ?? {};
    } catch {
      answers = (d.answers as DiagnosticAnswers) ?? {};
    }
  } else {
    answers = (d.answers as DiagnosticAnswers) ?? {};
  }
  return {
    answers,
    completedAt: (d.completedAt as string) ?? null,
    skipped: !!d.skipped,
  };
}

export async function setDiagnostic(
  uid: string,
  data: { answers: DiagnosticAnswers; completedAt: string | null; skipped: boolean }
): Promise<void> {
  const ref = db().collection(USERS).doc(uid).collection(DIAGNOSTIC_DOC).doc("v1");
  const encryptedAnswers = encrypt(JSON.stringify(data.answers), uid);
  await ref.set({
    encryptedAnswers,
    completedAt: data.completedAt,
    skipped: data.skipped,
  });
  if (data.completedAt && !data.skipped) {
    await db().collection(USERS).doc(uid).set({ diagnosticCompleted: true }, { merge: true });
  }
}

export async function getDiagnosticCompleted(uid: string): Promise<boolean> {
  const snap = await db().collection(USERS).doc(uid).get();
  return !!snap.data()?.diagnosticCompleted;
}

export async function getFinalQuizResult(uid: string): Promise<FinalQuizResult | null> {
  const ref = db().collection(USERS).doc(uid).collection(FINAL_QUIZ_DOC).doc("v1");
  const snap = await ref.get();
  if (!snap.exists) return null;
  const d = snap.data() as Record<string, unknown>;
  return {
    score: d.score as number,
    total: d.total as number,
    completedAt: d.completedAt as string,
  };
}

export async function setFinalQuizResult(
  uid: string,
  result: FinalQuizResult
): Promise<void> {
  const ref = db().collection(USERS).doc(uid).collection(FINAL_QUIZ_DOC).doc("v1");
  await ref.set(result);
  await db().collection(USERS).doc(uid).set({ quizCompleted: true }, { merge: true });
}

export async function getQuizCompleted(uid: string): Promise<boolean> {
  const snap = await db().collection(USERS).doc(uid).get();
  return !!snap.data()?.quizCompleted;
}

export async function getClosingSurvey(uid: string): Promise<ClosingSurveyData | null> {
  const ref = db().collection(USERS).doc(uid).collection(CLOSING_SURVEY_DOC).doc("v1");
  const snap = await ref.get();
  if (!snap.exists) return null;
  const d = snap.data() as Record<string, unknown>;
  const encrypted = d.encryptedPayload as string | undefined;
  if (encrypted) {
    try {
      const raw = decrypt(encrypted, uid);
      return raw ? (JSON.parse(raw) as ClosingSurveyData) : null;
    } catch {
      return d as unknown as ClosingSurveyData;
    }
  }
  return d as unknown as ClosingSurveyData;
}

export async function setClosingSurvey(uid: string, data: ClosingSurveyData): Promise<void> {
  const ref = db().collection(USERS).doc(uid).collection(CLOSING_SURVEY_DOC).doc("v1");
  const encryptedPayload = encrypt(JSON.stringify(data), uid);
  await ref.set({ encryptedPayload, completedAt: data.completedAt });
  await db().collection(USERS).doc(uid).set({ closingSurveyCompleted: true }, { merge: true });
}

/** Preguntas de ejemplo del quiz final (innovación pública). Admin puede sustituir por Firestore más adelante. */
export const DEFAULT_QUIZ_QUESTIONS: FinalQuizQuestion[] = [
  { id: "q1", question: "¿Qué se entiende por innovación pública?", options: ["Solo uso de tecnología en el Estado", "Cambio que genera valor para la ciudadanía desde el sector público", "Externalización de servicios", "Reducción de personal"], correctIndex: 1 },
  { id: "q2", question: "¿Cuál es un principio del diseño centrado en el usuario?", options: ["Priorizar la opinión del equipo directivo", "Entender las necesidades reales de las personas usuarias", "Implementar sin iterar", "Evitar la participación"], correctIndex: 1 },
  { id: "q3", question: "¿Qué herramienta permite priorizar ideas según impacto y esfuerzo?", options: ["Diagrama de Gantt", "Matriz impacto-esfuerzo", "Balance scorecard", "Análisis DAFO"], correctIndex: 1 },
  { id: "q4", question: "¿Qué rol suele tener un 'intraemprendedor' en innovación pública?", options: ["Solo auditor", "Promotor del cambio desde dentro de la organización", "Consultor externo", "Observador"], correctIndex: 1 },
  { id: "q5", question: "¿Qué significa 'fallar rápido' en innovación?", options: ["No intentar", "Aprender de pruebas tempranas y ajustar", "Ocultar errores", "Abandonar al primer obstáculo"], correctIndex: 1 },
  { id: "q6", question: "¿Cuál es un beneficio de la co-creación con la ciudadanía?", options: ["Menor legitimidad", "Soluciones más alineadas con necesidades reales", "Mayor burocracia", "Menor transparencia"], correctIndex: 1 },
  { id: "q7", question: "¿Qué mide el NPS (Net Promoter Score) en contexto de servicios públicos?", options: ["Solo costos", "Probabilidad de que los usuarios recomienden el servicio", "Tiempo de respuesta", "Número de reclamos"], correctIndex: 1 },
  { id: "q8", question: "¿Qué es un 'laboratorio de gobierno' o gov lab?", options: ["Solo un espacio físico", "Unidad que experimenta y prueba soluciones con metodologías ágiles", "Departamento de compras", "Oficina de prensa"], correctIndex: 1 },
  { id: "q9", question: "¿Por qué es importante la evaluación en innovación pública?", options: ["Solo para justificar presupuesto", "Para aprender qué funciona y escalar lo que aporta valor", "Para cumplir informes", "Para comparar con el sector privado"], correctIndex: 1 },
  { id: "q10", question: "¿Qué caracteriza a un equipo ágil en el sector público?", options: ["Rigidez en procesos", "Iteración, feedback y adaptación continua", "Trabajo en silos", "Planificación fija a 5 años"], correctIndex: 1 },
];

/** Resultados agregados para panel admin. */
export interface AdminEvaluationStats {
  diagnostic: {
    byExperience: Record<string, number>;
    byMotivation: Record<string, number>;
    total: number;
  };
  quiz: {
    averageScore: number;
    totalAttempts: number;
    passedCount: number;
    passPercent: number;
  };
  nps: {
    average: number;
    promoterCount: number;
    passiveCount: number;
    detractorCount: number;
    total: number;
  };
  blockAverages: {
    methodology: number;
    content: number;
    platform: number;
  };
  comments: { userId: string; comment: string; completedAt: string }[];
}

const QUIZ_PASS_THRESHOLD = 0.6;

function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export async function getAdminEvaluationStats(): Promise<AdminEvaluationStats> {
  const firestore = db();
  const [diagnosticSnap, quizSnap, surveySnap] = await Promise.all([
    firestore.collectionGroup(DIAGNOSTIC_DOC).get(),
    firestore.collectionGroup(FINAL_QUIZ_DOC).get(),
    firestore.collectionGroup(CLOSING_SURVEY_DOC).get(),
  ]);

  const byExperience: Record<string, number> = {};
  const byMotivation: Record<string, number> = {};
  let diagnosticTotal = 0;

  diagnosticSnap.docs.forEach((doc) => {
    const data = doc.data() as { answers?: DiagnosticAnswers };
    const a = data.answers;
    if (!a) return;
    diagnosticTotal++;
    byExperience[a.experience] = (byExperience[a.experience] ?? 0) + 1;
    byMotivation[a.motivation] = (byMotivation[a.motivation] ?? 0) + 1;
  });

  const quizScores: number[] = [];
  let quizPassed = 0;
  quizSnap.docs.forEach((doc) => {
    const d = doc.data() as { score?: number; total?: number };
    const score = Number(d.score);
    const total = Number(d.total);
    if (total > 0) {
      quizScores.push(score / total);
      if (score / total >= QUIZ_PASS_THRESHOLD) quizPassed++;
    }
  });

  const npsScores: number[] = [];
  const methodologyScores: number[] = [];
  const contentScores: number[] = [];
  const platformScores: number[] = [];
  const comments: { userId: string; comment: string; completedAt: string }[] = [];

  surveySnap.docs.forEach((doc) => {
    const d = doc.data() as ClosingSurveyData;
    const userId = doc.ref.parent.parent?.id ?? "";
    if (typeof d.nps === "number") npsScores.push(d.nps);
    if (Array.isArray(d.methodology)) d.methodology.forEach((n) => methodologyScores.push(Number(n)));
    if (Array.isArray(d.content)) d.content.forEach((n) => contentScores.push(Number(n)));
    if (Array.isArray(d.platform)) d.platform.forEach((n) => platformScores.push(Number(n)));
    if (d.comment?.trim()) comments.push({ userId, comment: d.comment.trim(), completedAt: d.completedAt ?? "" });
  });

  const npsTotal = npsScores.length;
  let promoterCount = 0, passiveCount = 0, detractorCount = 0;
  npsScores.forEach((n) => {
    if (n >= 9) promoterCount++;
    else if (n >= 7) passiveCount++;
    else detractorCount++;
  });

  return {
    diagnostic: { byExperience, byMotivation, total: diagnosticTotal },
    quiz: {
      averageScore: quizScores.length ? avg(quizScores) * 100 : 0,
      totalAttempts: quizScores.length,
      passedCount: quizPassed,
      passPercent: quizScores.length ? (quizPassed / quizScores.length) * 100 : 0,
    },
    nps: {
      average: npsTotal ? avg(npsScores) : 0,
      promoterCount,
      passiveCount,
      detractorCount,
      total: npsTotal,
    },
    blockAverages: {
      methodology: methodologyScores.length ? avg(methodologyScores) : 0,
      content: contentScores.length ? avg(contentScores) : 0,
      platform: platformScores.length ? avg(platformScores) : 0,
    },
    comments: comments.sort((a, b) => (b.completedAt || "").localeCompare(a.completedAt || "")),
  };
}

/** Filas para exportar a CSV (una por usuario con datos de evaluación). */
export interface AdminEvaluationExportRow {
  userId: string;
  diagnosticExperience: string;
  diagnosticMotivation: string;
  diagnosticChallenges: string;
  diagnosticExpectation: string;
  diagnosticAvailability: string;
  diagnosticSkipped: string;
  diagnosticCompletedAt: string;
  quizScore: string;
  quizTotal: string;
  quizPassed: string;
  quizCompletedAt: string;
  surveyMethodologyAvg: string;
  surveyContentAvg: string;
  surveyPlatformAvg: string;
  surveyNps: string;
  surveyComment: string;
  surveyCompletedAt: string;
}

export async function getAdminEvaluationExportRows(): Promise<AdminEvaluationExportRow[]> {
  const firestore = db();
  const [diagnosticSnap, quizSnap, surveySnap] = await Promise.all([
    firestore.collectionGroup(DIAGNOSTIC_DOC).get(),
    firestore.collectionGroup(FINAL_QUIZ_DOC).get(),
    firestore.collectionGroup(CLOSING_SURVEY_DOC).get(),
  ]);

  const userIds = new Set<string>();
  diagnosticSnap.docs.forEach((d) => { const uid = d.ref.parent.parent?.id; if (uid) userIds.add(uid); });
  quizSnap.docs.forEach((d) => { const uid = d.ref.parent.parent?.id; if (uid) userIds.add(uid); });
  surveySnap.docs.forEach((d) => { const uid = d.ref.parent.parent?.id; if (uid) userIds.add(uid); });

  const byUser: Record<string, Partial<AdminEvaluationExportRow>> = {};
  userIds.forEach((uid) => {
    byUser[uid] = { userId: uid };
  });

  diagnosticSnap.docs.forEach((doc) => {
    const uid = doc.ref.parent.parent?.id ?? "";
    const d = doc.data() as {
      answers?: DiagnosticAnswers;
      encryptedAnswers?: string;
      skipped?: boolean;
      completedAt?: string;
    };
    let a: DiagnosticAnswers | undefined = d.answers;
    if (d.encryptedAnswers && uid) {
      try {
        const raw = decrypt(d.encryptedAnswers, uid);
        a = raw ? (JSON.parse(raw) as DiagnosticAnswers) : undefined;
      } catch {
        a = undefined;
      }
    }
    if (!byUser[uid]) byUser[uid] = { userId: uid };
    const r = byUser[uid];
    r.diagnosticExperience = a?.experience ?? "";
    r.diagnosticMotivation = a?.motivation ?? "";
    r.diagnosticChallenges = Array.isArray(a?.challenges) ? a.challenges.join("; ") : "";
    r.diagnosticExpectation = a?.expectation ?? "";
    r.diagnosticAvailability = a?.availability ?? "";
    r.diagnosticSkipped = d.skipped ? "Sí" : "No";
    r.diagnosticCompletedAt = d.completedAt ?? "";
  });

  quizSnap.docs.forEach((doc) => {
    const uid = doc.ref.parent.parent?.id ?? "";
    const d = doc.data() as { score?: number; total?: number; completedAt?: string };
    if (!byUser[uid]) byUser[uid] = { userId: uid };
    const r = byUser[uid];
    r.quizScore = String(d.score ?? "");
    r.quizTotal = String(d.total ?? "");
    r.quizPassed = (d.total && d.score != null && d.score / d.total >= QUIZ_PASS_THRESHOLD) ? "Sí" : "No";
    r.quizCompletedAt = d.completedAt ?? "";
  });

  surveySnap.docs.forEach((doc) => {
    const uid = doc.ref.parent.parent?.id ?? "";
    const d = doc.data() as ClosingSurveyData & { encryptedPayload?: string };
    let survey: ClosingSurveyData = d;
    if (d.encryptedPayload && uid) {
      try {
        const raw = decrypt(d.encryptedPayload, uid);
        survey = raw ? (JSON.parse(raw) as ClosingSurveyData) : d;
      } catch {
        survey = d;
      }
    }
    if (!byUser[uid]) byUser[uid] = { userId: uid };
    const r = byUser[uid];
    const m = Array.isArray(survey.methodology) ? avg(survey.methodology.map(Number)) : 0;
    const c = Array.isArray(survey.content) ? avg(survey.content.map(Number)) : 0;
    const p = Array.isArray(survey.platform) ? avg(survey.platform.map(Number)) : 0;
    r.surveyMethodologyAvg = m.toFixed(2);
    r.surveyContentAvg = c.toFixed(2);
    r.surveyPlatformAvg = p.toFixed(2);
    r.surveyNps = String(survey.nps ?? "");
    r.surveyComment = (survey.comment ?? "").replace(/[\r\n]+/g, " ");
    r.surveyCompletedAt = survey.completedAt ?? "";
  });

  return Object.values(byUser).map((r) => ({
    userId: r.userId ?? "",
    diagnosticExperience: r.diagnosticExperience ?? "",
    diagnosticMotivation: r.diagnosticMotivation ?? "",
    diagnosticChallenges: r.diagnosticChallenges ?? "",
    diagnosticExpectation: r.diagnosticExpectation ?? "",
    diagnosticAvailability: r.diagnosticAvailability ?? "",
    diagnosticSkipped: r.diagnosticSkipped ?? "",
    diagnosticCompletedAt: r.diagnosticCompletedAt ?? "",
    quizScore: r.quizScore ?? "",
    quizTotal: r.quizTotal ?? "",
    quizPassed: r.quizPassed ?? "",
    quizCompletedAt: r.quizCompletedAt ?? "",
    surveyMethodologyAvg: r.surveyMethodologyAvg ?? "",
    surveyContentAvg: r.surveyContentAvg ?? "",
    surveyPlatformAvg: r.surveyPlatformAvg ?? "",
    surveyNps: r.surveyNps ?? "",
    surveyComment: r.surveyComment ?? "",
    surveyCompletedAt: r.surveyCompletedAt ?? "",
  }));
}

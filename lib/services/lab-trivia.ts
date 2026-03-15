/**
 * Trivia semanal del Laboratorio — ¿Quién innova más?
 * Firestore: lab_trivia/weekly/{weekId}/questions, lab_trivia/weekly/{weekId}/scores/{userId}
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { getDemoMode } from "@/lib/env";

export interface TriviaQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const COLL = "lab_trivia";
const DEMO_WEEK = "2026-03-10"; // lunes demo

function getWeekStart(d: Date): string {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().slice(0, 10);
}

export function getWeekId(date: Date = new Date()): string {
  return getWeekStart(date);
}

const DEMO_QUESTIONS: TriviaQuestion[] = [
  {
    question: "¿Qué país fue el primero en tener un ministerio del futuro?",
    options: ["Dinamarca", "Finlandia (2017)", "Estonia", "Singapur"],
    correctIndex: 1,
    explanation: "Finlandia creó en 2017 el primer Ministerio del Futuro del mundo, dedicado al pensamiento de largo plazo y prospectiva.",
  },
  {
    question: "¿Cómo se llama el proceso de co-crear políticas con ciudadanos?",
    options: ["Consultoría externa", "Co-diseño / Participación ciudadana", "Lobby", "Audiencia pública"],
    correctIndex: 1,
    explanation: "El co-diseño y la participación ciudadana implican involucrar a la ciudadanía en el diseño de políticas y servicios.",
  },
  {
    question: "¿Qué significa 'GovTech'?",
    options: ["Gobierno tradicional", "Tecnología aplicada al gobierno", "Gobierno tecnócrata", "Venta de software al Estado"],
    correctIndex: 1,
    explanation: "GovTech se refiere a la aplicación de tecnología e innovación para mejorar la gestión y los servicios gubernamentales.",
  },
  {
    question: "¿Qué país latinoamericano lideró el índice de innovación pública en 2023?",
    options: ["Argentina", "Colombia", "Chile", "Uruguay"],
    correctIndex: 2,
    explanation: "Chile ha liderado rankings regionales de innovación pública y gobierno digital.",
  },
  {
    question: "¿Qué es un 'laboratorio de gobierno'?",
    options: ["Un edificio de ciencia", "Espacio de experimentación de políticas públicas", "Centro de datos del Estado", "Agencia de compras"],
    correctIndex: 1,
    explanation: "Los laboratorios de gobierno son espacios para prototipar y probar soluciones de políticas públicas con enfoque ágil.",
  },
];

export async function getWeeklyQuestions(weekId: string): Promise<TriviaQuestion[]> {
  if (getDemoMode()) return DEMO_QUESTIONS;
  try {
    const db = getFirebaseAdminFirestore();
    const doc = await db.collection(COLL).doc("weekly").collection(weekId).doc("questions").get();
    const data = doc.data();
    const questions = (data?.questions as TriviaQuestion[] | undefined) ?? [];
    if (questions.length >= 5) return questions.slice(0, 5);
    return DEMO_QUESTIONS;
  } catch {
    return DEMO_QUESTIONS;
  }
}

export async function setWeeklyQuestions(weekId: string, questions: TriviaQuestion[]): Promise<void> {
  if (getDemoMode()) return;
  const db = getFirebaseAdminFirestore();
  await db.collection(COLL).doc("weekly").collection(weekId).doc("questions").set({
    questions: questions.slice(0, 5),
    updatedAt: new Date().toISOString(),
  });
}

export interface TriviaScoreEntry {
  userId: string;
  score: number;
  completedAt: string;
  cohortId: string;
  displayName?: string;
}

export async function submitScore(
  weekId: string,
  userId: string,
  cohortId: string,
  score: number,
  displayName?: string
): Promise<void> {
  if (getDemoMode()) return;
  const db = getFirebaseAdminFirestore();
  const ref = db
    .collection(COLL)
    .doc("weekly")
    .collection(weekId)
    .doc("scores")
    .collection("scores")
    .doc(userId);
  const doc = await ref.get();
  const now = new Date().toISOString();
  if (doc.exists) {
    const existing = doc.data();
    if ((existing?.score as number) >= score) return;
  }
  await ref.set({
    score,
    completedAt: now,
    cohortId,
    displayName: displayName ?? null,
  });
}

export async function getRanking(weekId: string, cohortId: string): Promise<TriviaScoreEntry[]> {
  if (getDemoMode()) {
    return [
      { userId: "u1", score: 5, completedAt: new Date().toISOString(), cohortId: "demo-cohort-id", displayName: "Innovador de la semana" },
      { userId: "u2", score: 4, completedAt: new Date().toISOString(), cohortId: "demo-cohort-id", displayName: "Segundo lugar" },
      { userId: "u3", score: 3, completedAt: new Date().toISOString(), cohortId: "demo-cohort-id", displayName: "Tercero" },
    ];
  }
  const db = getFirebaseAdminFirestore();
  const snap = await db
    .collection(COLL)
    .doc("weekly")
    .collection(weekId)
    .doc("scores")
    .collection("scores")
    .where("cohortId", "==", cohortId)
    .orderBy("score", "desc")
    .limit(20)
    .get();
  const entries: TriviaScoreEntry[] = snap.docs.map((d) => {
    const data = d.data();
    return {
      userId: d.id,
      score: data.score as number,
      completedAt: data.completedAt as string,
      cohortId: data.cohortId as string,
      displayName: data.displayName as string | undefined,
    };
  });
  return entries;
}

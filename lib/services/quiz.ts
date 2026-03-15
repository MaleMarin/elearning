/**
 * Banco de preguntas y quizzes. Firestore: question_bank, quizzes, users/{uid}/quizAttempts.
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

const QUESTION_BANK = "question_bank";
const QUIZZES = "quizzes";
const QUIZ_ATTEMPTS = "quizAttempts";

export type QuestionType = "multiple_choice" | "true_false" | "short_answer";
export type Difficulty = "easy" | "medium" | "hard";

export interface Question {
  id: string;
  courseId: string;
  moduleId: string | null;
  question: string;
  type: QuestionType;
  options: string[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: Difficulty;
  tags: string[];
  createdAt: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  questionCount: number;
  passingScore: number;
  timeLimit: number;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  maxAttempts: number;
  showExplanations: boolean;
  moduleId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  questionsServed: string[];
  answers: Record<string, string | number>;
  score: number;
  passed: boolean;
  startedAt: string;
  completedAt: string | null;
  attemptNumber: number;
}

function db() {
  return getFirebaseAdminFirestore();
}

// --- Question bank ---
export async function listQuestions(filters: {
  courseId?: string;
  moduleId?: string | null;
  difficulty?: Difficulty;
  tag?: string;
}): Promise<Question[]> {
  let q = db().collection(QUESTION_BANK).orderBy("createdAt", "desc");
  if (filters.courseId) q = q.where("courseId", "==", filters.courseId);
  const snap = await q.get();
  let list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Question));
  if (filters.moduleId !== undefined) list = list.filter((x) => x.moduleId === filters.moduleId);
  if (filters.difficulty) list = list.filter((x) => x.difficulty === filters.difficulty);
  if (filters.tag) list = list.filter((x) => x.tags.includes(filters.tag!));
  return list;
}

export async function getQuestion(questionId: string): Promise<Question | null> {
  const doc = await db().collection(QUESTION_BANK).doc(questionId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Question;
}

export async function createQuestion(data: Omit<Question, "id" | "createdAt">): Promise<Question> {
  const ref = db().collection(QUESTION_BANK).doc();
  const now = new Date().toISOString();
  await ref.set({
    ...data,
    createdAt: now,
  });
  const snap = await ref.get();
  return { id: snap.id, ...snap.data(), createdAt: now } as Question;
}

export async function updateQuestion(questionId: string, data: Partial<Omit<Question, "id" | "createdAt">>): Promise<void> {
  await db().collection(QUESTION_BANK).doc(questionId).update(data);
}

export async function deleteQuestion(questionId: string): Promise<void> {
  await db().collection(QUESTION_BANK).doc(questionId).delete();
}

// --- Quizzes ---
export async function listQuizzes(courseId?: string): Promise<Quiz[]> {
  let q = db().collection(QUIZZES).orderBy("updatedAt", "desc");
  if (courseId) q = q.where("courseId", "==", courseId);
  const snap = await q.get();
  return snap.docs.map((d) => {
    const x = d.data();
    return {
      id: d.id,
      courseId: x.courseId,
      title: x.title,
      questionCount: x.questionCount ?? 0,
      passingScore: x.passingScore ?? 60,
      timeLimit: x.timeLimit ?? 0,
      randomizeQuestions: x.randomizeQuestions !== false,
      randomizeOptions: x.randomizeOptions !== false,
      maxAttempts: x.maxAttempts ?? 0,
      showExplanations: x.showExplanations !== false,
      moduleId: x.moduleId ?? null,
      createdAt: x.createdAt ?? "",
      updatedAt: x.updatedAt ?? "",
    } as Quiz;
  });
}

export async function getQuiz(quizId: string): Promise<Quiz | null> {
  const doc = await db().collection(QUIZZES).doc(quizId).get();
  if (!doc.exists) return null;
  const x = doc.data()!;
  return {
    id: doc.id,
    courseId: x.courseId,
    title: x.title,
    questionCount: x.questionCount ?? 0,
    passingScore: x.passingScore ?? 60,
    timeLimit: x.timeLimit ?? 0,
    randomizeQuestions: x.randomizeQuestions !== false,
    randomizeOptions: x.randomizeOptions !== false,
    maxAttempts: x.maxAttempts ?? 0,
    showExplanations: x.showExplanations !== false,
    moduleId: x.moduleId ?? null,
    createdAt: x.createdAt ?? "",
    updatedAt: x.updatedAt ?? "",
  } as Quiz;
}

export async function createQuiz(data: Omit<Quiz, "id" | "createdAt" | "updatedAt">): Promise<Quiz> {
  const ref = db().collection(QUIZZES).doc();
  const now = new Date().toISOString();
  await ref.set({
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  const snap = await ref.get();
  const x = snap.data()!;
  return { id: snap.id, ...x, createdAt: now, updatedAt: now } as Quiz;
}

export async function updateQuiz(quizId: string, data: Partial<Omit<Quiz, "id" | "createdAt">>): Promise<void> {
  await db().collection(QUIZZES).doc(quizId).update({ ...data, updatedAt: new Date().toISOString() });
}

export async function deleteQuiz(quizId: string): Promise<void> {
  await db().collection(QUIZZES).doc(quizId).delete();
}

// --- Attempts: pick questions and create/complete attempt ---
export async function getAttempts(userId: string, quizId: string): Promise<QuizAttempt[]> {
  const snap = await db()
    .collection("users")
    .doc(userId)
    .collection(QUIZ_ATTEMPTS)
    .where("quizId", "==", quizId)
    .orderBy("startedAt", "desc")
    .get();
  return snap.docs.map((d) => {
    const x = d.data();
    return {
      id: d.id,
      quizId: x.quizId,
      questionsServed: x.questionsServed ?? [],
      answers: x.answers ?? {},
      score: x.score ?? 0,
      passed: !!x.passed,
      startedAt: x.startedAt ?? "",
      completedAt: x.completedAt ?? null,
      attemptNumber: x.attemptNumber ?? 0,
    } as QuizAttempt;
  });
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export async function startAttempt(userId: string, quizId: string): Promise<{ attempt: QuizAttempt; questions: Question[] } | null> {
  const quiz = await getQuiz(quizId);
  if (!quiz) return null;
  const attempts = await getAttempts(userId, quizId);
  if (quiz.maxAttempts > 0 && attempts.length >= quiz.maxAttempts) return null;
  const lastCompleted = attempts.find((a) => a.completedAt);
  if (lastCompleted && lastCompleted.completedAt != null && quiz.maxAttempts > 0) {
    const nextAllowed = new Date(lastCompleted.completedAt);
    nextAllowed.setHours(nextAllowed.getHours() + 24);
    if (new Date() < nextAllowed) return null;
  }
  const filter: { courseId: string; moduleId?: string } = { courseId: quiz.courseId };
  if (quiz.moduleId) filter.moduleId = quiz.moduleId;
  const pool = await listQuestions(filter);
  if (pool.length < quiz.questionCount) return null;
  const selected = shuffle(pool).slice(0, quiz.questionCount);
  const questionIds = selected.map((q) => q.id);
  const questions = quiz.randomizeOptions
    ? selected.map((q) => ({
        ...q,
        options: q.options.length ? shuffle(q.options) : q.options,
      }))
    : selected;
  const ref = db().collection("users").doc(userId).collection(QUIZ_ATTEMPTS).doc();
  const now = new Date().toISOString();
  const attempt: QuizAttempt = {
    id: ref.id,
    quizId,
    questionsServed: questionIds,
    answers: {},
    score: 0,
    passed: false,
    startedAt: now,
    completedAt: null,
    attemptNumber: attempts.length + 1,
  };
  await ref.set({
    quizId,
    questionsServed: questionIds,
    answers: {},
    score: 0,
    passed: false,
    startedAt: now,
    completedAt: null,
    attemptNumber: attempt.attemptNumber,
  });
  return { attempt, questions };
}

export async function getAttempt(userId: string, attemptId: string): Promise<QuizAttempt | null> {
  const doc = await db().collection("users").doc(userId).collection(QUIZ_ATTEMPTS).doc(attemptId).get();
  if (!doc.exists) return null;
  const x = doc.data()!;
  return {
    id: doc.id,
    quizId: x.quizId,
    questionsServed: x.questionsServed ?? [],
    answers: x.answers ?? {},
    score: x.score ?? 0,
    passed: !!x.passed,
    startedAt: x.startedAt ?? "",
    completedAt: x.completedAt ?? null,
    attemptNumber: x.attemptNumber ?? 0,
  } as QuizAttempt;
}

export async function submitAttempt(
  userId: string,
  attemptId: string,
  answers: Record<string, string | number>
): Promise<{ attempt: QuizAttempt; questions: Question[]; score: number; passed: boolean } | null> {
  const attemptDoc = await db().collection("users").doc(userId).collection(QUIZ_ATTEMPTS).doc(attemptId).get();
  if (!attemptDoc.exists || attemptDoc.data()?.completedAt) return null;
  const attempt = await getAttempt(userId, attemptId);
  if (!attempt) return null;
  const quiz = await getQuiz(attempt.quizId);
  if (!quiz) return null;
  const questions: Question[] = [];
  for (const qid of attempt.questionsServed) {
    const q = await getQuestion(qid);
    if (q) questions.push(q);
  }
  let correct = 0;
  for (const q of questions) {
    const userVal = answers[q.id];
    const correctVal = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
    let match = false;
    if (q.options.length && typeof userVal === "number" && q.options[userVal] !== undefined) {
      const selectedText = q.options[userVal];
      match = correctVal.some((c) => String(c).trim().toLowerCase() === String(selectedText).trim().toLowerCase());
    } else {
      match = correctVal.some((c) => String(userVal).trim().toLowerCase() === String(c).trim().toLowerCase());
    }
    if (match) correct++;
  }
  const score = questions.length ? Math.round((correct / questions.length) * 100) : 0;
  const passed = score >= quiz.passingScore;
  const now = new Date().toISOString();
  await attemptDoc.ref.update({
    answers,
    score,
    passed,
    completedAt: now,
  });
  return {
    attempt: { ...attempt, answers, score, passed, completedAt: now },
    questions,
    score,
    passed,
  };
}

// --- Admin stats ---
export async function getQuizStats(quizId: string): Promise<{
  totalAttempts: number;
  passedCount: number;
  passPercent: number;
  questionErrors: Record<string, number>;
}> {
  const groups = await db().collectionGroup(QUIZ_ATTEMPTS).where("quizId", "==", quizId).get();
  let total = 0;
  let passed = 0;
  const questionErrors: Record<string, number> = {};
  for (const doc of groups.docs) {
    const d = doc.data();
    if (d.completedAt) {
      total++;
      if (d.passed) passed++;
      const questionsServed = (d.questionsServed as string[]) ?? [];
      const answers = (d.answers as Record<string, string | number>) ?? {};
      for (const qid of questionsServed) {
        const q = await getQuestion(qid);
        if (!q) continue;
        const userVal = answers[qid];
        const correctVal = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
        let match = false;
        if (q.options?.length && typeof userVal === "number" && q.options[userVal] !== undefined) {
          const selectedText = q.options[userVal];
          match = correctVal.some((c) => String(c).trim().toLowerCase() === String(selectedText).trim().toLowerCase());
        } else {
          match = correctVal.some((c) => String(userVal).trim().toLowerCase() === String(c).trim().toLowerCase());
        }
        if (!match) questionErrors[qid] = (questionErrors[qid] ?? 0) + 1;
      }
    }
  }
  return {
    totalAttempts: total,
    passedCount: passed,
    passPercent: total ? (passed / total) * 100 : 0,
    questionErrors,
  };
}

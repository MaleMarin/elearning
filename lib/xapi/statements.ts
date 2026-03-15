/**
 * Funciones para enviar statements xAPI al LRS.
 * Verbos: experienced, completed, answered, paused, earned, abandoned.
 * Se ignoran silenciosamente si el cliente xAPI no está configurado.
 */

import xapi, { isXAPIEnabled } from "./client";

const ACTIVITY_BASE = "https://politicadigital.gob.mx/elearning/";

function agent(userId: string): { objectType: "Agent"; account: { homePage: string; name: string }; name?: string } {
  return {
    objectType: "Agent",
    account: { homePage: "https://politicadigital.gob.mx/", name: userId },
    name: userId,
  };
}

function activity(
  id: string,
  displayName: string
): { id: string; definition: { name: { "es": string } } } {
  return {
    id: ACTIVITY_BASE + id,
    definition: { name: { "es": displayName } },
  };
}

function send(statement: import("@xapi/xapi").Statement): void {
  if (!xapi || !isXAPIEnabled()) return;
  xapi.sendStatement({ statement }).catch(() => {});
}

/** Lección iniciada / experimentada */
export function trackLessonStarted(userId: string, lessonId: string, lessonTitle: string): void {
  send({
    actor: agent(userId),
    verb: { id: "http://adlnet.gov/expapi/verbs/experienced", display: { "es": "experimentó" } },
    object: activity(`lesson/${lessonId}`, lessonTitle),
  });
}

/** Lección completada (con puntuación opcional) */
export function trackLessonCompleted(
  userId: string,
  lessonId: string,
  lessonTitle: string,
  score?: number
): void {
  const statement: import("@xapi/xapi").Statement = {
    actor: agent(userId),
    verb: { id: "http://adlnet.gov/expapi/verbs/completed", display: { "es": "completó" } },
    object: activity(`lesson/${lessonId}`, lessonTitle),
  };
  if (score !== undefined && score !== null) {
    statement.result = { score: { scaled: score / 100, raw: score, min: 0, max: 100 } };
  }
  send(statement);
}

/** Pregunta de quiz respondida */
export function trackQuizAnswered(
  userId: string,
  questionId: string,
  isCorrect: boolean,
  response: string
): void {
  send({
    actor: agent(userId),
    verb: { id: "http://adlnet.gov/expapi/verbs/answered", display: { "es": "respondió" } },
    object: activity(`question/${questionId}`, questionId),
    result: { success: isCorrect, response },
  });
}

/** Video pausado en un segundo dado */
export function trackVideoPaused(userId: string, lessonId: string, secondsPaused: number): void {
  send({
    actor: agent(userId),
    verb: { id: "https://w3id.org/xapi/dod-isd/verbs/paused", display: { "es": "pausó" } },
    object: activity(`lesson/${lessonId}/video`, `Video lección ${lessonId}`),
    result: { extensions: { "https://politicadigital.gob.mx/expapi/seconds": secondsPaused } },
  });
}

/** Badge obtenido */
export function trackBadgeEarned(userId: string, badgeName: string): void {
  send({
    actor: agent(userId),
    verb: { id: "http://adlnet.gov/expapi/verbs/earned", display: { "es": "obtuvo" } },
    object: activity(`badge/${badgeName}`, badgeName),
  });
}

/** Módulo abandonado (progreso al salir) */
export function trackModuleAbandoned(userId: string, moduleId: string, progressPercent: number): void {
  send({
    actor: agent(userId),
    verb: { id: "https://w3id.org/xapi/dod-isd/verbs/abandoned", display: { "es": "abandonó" } },
    object: activity(`module/${moduleId}`, `Módulo ${moduleId}`),
    result: {
      score: { scaled: progressPercent / 100, raw: progressPercent, min: 0, max: 100 },
      extensions: { "https://politicadigital.gob.mx/expapi/progress_percent": progressPercent },
    },
  });
}

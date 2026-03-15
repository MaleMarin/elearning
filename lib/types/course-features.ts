/**
 * Feature flags por curso. El admin activa/desactiva funcionalidades por curso.
 * Firestore: /courses/{courseId}/features/config
 */

export interface CourseFeatures {
  // Aprendizaje
  audioLecciones: boolean;
  vozRespuestas: boolean;
  diarioAprendizaje: boolean;
  cartaFuturo: boolean;
  checkInBienestar: boolean;
  checkInCognitivo: boolean;

  // Evaluación
  simuladorPolitica: boolean;
  portafolioTransformacion: boolean;
  peerReview: boolean;
  evaluacionFinal: boolean;

  // Gamificación
  puntos: boolean;
  badges: boolean;
  misionesSemanales: boolean;
  leaderboard: boolean;

  // Comunidad
  foro: boolean;
  miColega: boolean;
  mentores: boolean;
  retosCohorte: boolean;

  // El Laboratorio
  laboratorio: boolean;
  trivia: boolean;
  habitasHumano: boolean;
  simulaciones: boolean;

  // Notificaciones
  whatsapp: boolean;
  pushNotifications: boolean;
  spacedRepetition: boolean;

  // Contenido
  sesionesEnVivo: boolean;
  grabaciones: boolean;
  bibliografia: boolean;
  podcasts: boolean;

  // Certificado
  certificado: boolean;
  qrVerificacion: boolean;
}

/** Valores por defecto: todo desactivado (el admin elige qué activar). */
export const DEFAULT_COURSE_FEATURES: CourseFeatures = {
  audioLecciones: false,
  vozRespuestas: false,
  diarioAprendizaje: false,
  cartaFuturo: false,
  checkInBienestar: false,
  checkInCognitivo: false,
  simuladorPolitica: false,
  portafolioTransformacion: false,
  peerReview: false,
  evaluacionFinal: false,
  puntos: false,
  badges: false,
  misionesSemanales: false,
  leaderboard: false,
  foro: false,
  miColega: false,
  mentores: false,
  retosCohorte: false,
  laboratorio: false,
  trivia: false,
  habitasHumano: false,
  simulaciones: false,
  whatsapp: false,
  pushNotifications: false,
  spacedRepetition: false,
  sesionesEnVivo: false,
  grabaciones: false,
  bibliografia: false,
  podcasts: false,
  certificado: false,
  qrVerificacion: false,
};

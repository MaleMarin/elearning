/**
 * Propuestas de lecciones UGC (Firestore /lessonProposals/{id}) — BRECHA 5.
 */

export type PropuestaEstado =
  | "borrador"
  | "enviada"
  | "en_revision"
  | "aprobada"
  | "rechazada";

export interface PropuestaQuizItem {
  question: string;
  correctAnswer: string;
  wrongOptions: string[];
  explanation: string;
}

/** Estructura generada por Claude a partir de experiencia real. */
export interface ContenidoGenerado {
  objetivo: string;
  introduccion: string;
  desarrollo: string;
  actividad: string;
  quiz: PropuestaQuizItem[];
}

export interface LessonProposalFirestore {
  autorId: string;
  autorNombre: string;
  autorInstitucion: string;
  titulo: string;
  descripcion: string;
  experienciaReal: string;
  moduleIdSugerido: string;
  estado: PropuestaEstado;
  feedbackAdmin: string;
  contenidoGenerado: ContenidoGenerado | null;
  createdAt: unknown;
  updatedAt?: unknown;
}

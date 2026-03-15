/**
 * Retos de cohorte colaborativos (Brecha 8).
 */

export type ChallengeEstado = "proximo" | "activo" | "evaluando" | "completado";

export interface EvaluationScore {
  score: number;
  retroalimentacion: string;
  /** Criterios desglosados opcionales */
  criterios?: Record<string, number>;
}

export interface Team {
  id: string;
  nombre: string;
  miembros: string[];
  propuesta: string;
  submittedAt: string | null;
  scoresClaude: EvaluationScore | null;
}

export interface CohortChallenge {
  id: string;
  cohortId: string;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  estado: ChallengeEstado;
  criteriosEvaluacion: string[];
  premioDescripcion: string;
  equipos: Team[];
  ganador: string | null;
  createdAt: string;
}

export interface ChallengeMessage {
  id: string;
  userId: string;
  userName?: string;
  text: string;
  createdAt: string;
}

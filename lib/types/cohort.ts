/**
 * Modelo de cohorte (Firestore /cohorts/{cohortId}) — BRECHA 4.
 */

export type CohortEstado = "proxima" | "activa" | "finalizada";

export interface CohortConfiguracion {
  permitirAutoInscripcion: boolean;
  maxAlumnos: number;
  esPrivada: boolean;
}

/** Timestamp en Firestore puede ser objeto con toDate() o ISO string según contexto. */
export interface CohortFirestore {
  nombre: string;
  courseId: string;
  facilitadorId: string;
  fechaInicio: unknown;
  fechaFin: unknown;
  estado: CohortEstado;
  alumnos: string[];
  codigoInvitacion: string;
  limiteFechasPorModulo?: Record<string, unknown>;
  configuracion: CohortConfiguracion;
  created_at?: string;
  updated_at?: string;
}

/** Campos legacy compat (name, starts_at, etc.) se mantienen opcionales. */
export type CohortDocument = CohortFirestore & {
  name?: string;
  description?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  timezone?: string;
  capacity?: number;
  is_active?: boolean;
};

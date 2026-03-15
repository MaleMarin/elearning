/**
 * Portafolio de transformación — proyecto real documentado por el alumno (Brecha 5).
 */

export type EstadoProyecto = "idea" | "en_progreso" | "implementado" | "escalado";

export interface PortfolioProject {
  id: string;
  titulo: string;
  institucion: string;
  problema: string;
  solucion: string;
  resultado: string;
  ciudadanosBeneficiados: number;
  modulos: string[];
  evidencias: string[];
  estadoProyecto: EstadoProyecto;
  fechaInicio: string;
  evaluacionClaude: string;
  scoreImpacto: number;
  publico: boolean;
  createdAt: string;
  updatedAt?: string;
}

/** Payload para crear/actualizar (sin id ni timestamps). */
export interface PortfolioProjectInput {
  titulo: string;
  institucion: string;
  problema: string;
  solucion: string;
  resultado: string;
  ciudadanosBeneficiados: number;
  modulos: string[];
  evidencias: string[];
  estadoProyecto: EstadoProyecto;
  fechaInicio: string;
  evaluacionClaude?: string;
  scoreImpacto?: number;
  publico?: boolean;
}

/** Respuesta de la API de evaluación Claude. */
export interface PortfolioEvaluacion {
  evaluacionClaude: string;
  scoreImpacto: number;
  sugerencias?: string[];
}

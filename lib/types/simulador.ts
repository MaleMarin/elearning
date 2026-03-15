/**
 * Tipos para el Simulador de Política Pública (Brecha 2).
 */

export interface Simulation {
  id: string;
  titulo: string;
  contexto: string;
  presupuesto: string;
  tiempo: string;
  equipo: string;
  modulo: string;
  criterios: string[];
  dificultad: "basico" | "intermedio" | "avanzado";
  duracionMinutos: number;
}

export interface SimulationEvaluation {
  scoreTotal: number;
  scoresPorCriterio: Record<string, number>;
  fortalezas: string[];
  areasdemejora: string[];
  retroalimentacion: string;
  decisionClave: string;
  errorCritico: string;
  nivelEstrategico: "operativo" | "tactico" | "estrategico";
}

/** Preguntas estándar para la fase de decisiones (5 preguntas abiertas). */
export const SIMULATION_QUESTIONS = [
  "¿Cuál es tu primer movimiento en las primeras 48 horas?",
  "¿Cómo manejas la resistencia del director de sistemas (o el principal obstáculo del escenario)?",
  "¿Qué KPIs usarías para medir el éxito?",
  "¿Qué harías si el presupuesto se reduce 50% a la mitad del proyecto?",
  "¿Cómo comunicas el cambio a los ciudadanos o a los afectados?",
] as const;

export const MIN_WORDS_PER_ANSWER = 50;

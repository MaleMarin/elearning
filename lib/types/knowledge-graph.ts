/**
 * Red neuronal de conocimiento institucional (Brecha 6).
 */

export interface KnowledgeNode {
  id: string;
  concepto: string;
  usuariosQueLoDominan: number;
  nivelPromedio: number;
  relacionados: string[];
  modulo: string;
  ultimaActualizacion: string;
}

export interface KnowledgeLearner {
  userId: string;
  lessonId: string;
  completedAt: string;
  userName?: string;
}

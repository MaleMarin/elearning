/**
 * Tipo de contexto para el asistente (diseño instruccional Mayer / Nielsen).
 * Usado por la API del asistente y por los componentes que envían contexto.
 */

export interface AssistantContext {
  role: "student" | "admin";
  userName?: string;
  lessonName?: string;
  moduleName?: string;
  progress?: number;
  lessonsCompleted?: number;
  totalLessons?: number;
  courseId?: string;
  totalStudents?: number;
  avgProgress?: number;
  /** Trigger de aparición proactiva */
  trigger?: "module_complete" | "quiz_failed" | "inactive" | "first_login" | "manual";
  /** Modo roleplay: escenario y personaje para el bot */
  roleplayScenarioId?: string;
  roleplayScenarioTitle?: string;
  roleplayCharacter?: string;
  roleplayOpeningLine?: string;
}

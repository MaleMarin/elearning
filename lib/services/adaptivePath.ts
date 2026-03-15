/**
 * Pathways adaptativos: orden sugerido de módulos según diagnóstico y rendimiento.
 * Siempre sugerencia; el alumno puede elegir su propio orden.
 */

export type DiagnosticLevel = "sin_experiencia" | "experiencia_practica" | "avanzado" | "unknown";

export interface AdaptiveInput {
  /** Nivel derivado del diagnóstico inicial (experience). */
  diagnosticLevel: DiagnosticLevel;
  /** Módulos del curso en orden por defecto. */
  moduleIds: string[];
  /** IDs de lecciones completadas. */
  completedLessonIds: string[];
  /** Lecciones por módulo: moduleId -> lessonIds[]. */
  lessonsByModule: Record<string, string[]>;
  /** Módulos donde el alumno falló el quiz 2+ veces. */
  moduleIdsWithQuizFailures?: string[];
}

export interface AdaptiveResult {
  /** Orden sugerido de módulos (puede ser igual o reordenado). */
  suggestedModuleOrder: string[];
  /** Siguiente paso sugerido. */
  nextStep: {
    type: "module" | "lesson" | "refinement";
    moduleId: string | null;
    lessonId: string | null;
    label: string;
  };
  /** Razón breve para mostrar en UI. */
  reason?: string;
}

/**
 * Mapea la respuesta "experience" del diagnóstico a nivel.
 */
export function diagnosticLevelFromExperience(experience: string | undefined): DiagnosticLevel {
  if (!experience || typeof experience !== "string") return "unknown";
  const v = experience.toLowerCase();
  if (v.includes("sin experiencia") || v.includes("ninguna") || v.includes("principiante")) return "sin_experiencia";
  if (v.includes("experiencia práctica") || v.includes("práctica") || v.includes("intermedio")) return "experiencia_practica";
  if (v.includes("avanzado") || v.includes("experto")) return "avanzado";
  return "unknown";
}

/**
 * Calcula el orden sugerido de módulos y el siguiente paso.
 */
export function getAdaptivePath(input: AdaptiveInput): AdaptiveResult {
  const { diagnosticLevel, moduleIds, completedLessonIds, lessonsByModule, moduleIdsWithQuizFailures = [] } = input;
  const completedSet = new Set(completedLessonIds);

  const moduleProgress = moduleIds.map((mid) => {
    const lessonIds = lessonsByModule[mid] ?? [];
    const done = lessonIds.filter((id) => completedSet.has(id)).length;
    const total = lessonIds.length;
    return { moduleId: mid, done, total, complete: total > 0 && done === total };
  });

  // ¿Algún módulo con fallos de quiz que deba refuerzo?
  const needsRefinement = moduleIdsWithQuizFailures.find((mid) => {
    const p = moduleProgress.find((x) => x.moduleId === mid);
    return p && !p.complete;
  });

  let suggestedOrder = [...moduleIds];
  let reason: string | undefined;
  let nextStep: AdaptiveResult["nextStep"] = {
    type: "module",
    moduleId: null,
    lessonId: null,
    label: "Continuar con el curso",
  };

  // Experiencia práctica: sugerir saltar intro si el primer módulo está completo o tiene quiz de validación
  if (diagnosticLevel === "experiencia_practica" && moduleIds.length > 1) {
    const firstDone = moduleProgress[0]?.complete ?? false;
    if (firstDone) {
      const nextIncomplete = moduleProgress.find((p) => !p.complete);
      if (nextIncomplete) {
        nextStep = {
          type: "module",
          moduleId: nextIncomplete.moduleId,
          lessonId: null,
          label: `Ir a ${nextIncomplete.moduleId}`,
        };
        reason = "Tienes experiencia; te sugerimos continuar donde lo dejaste.";
      }
    }
  }

  // Sin experiencia: orden por defecto; siguiente = primera lección no completada
  if (diagnosticLevel === "sin_experiencia" || diagnosticLevel === "unknown") {
    reason = reason ?? "Te recomendamos seguir el orden de los módulos.";
  }

  // Siguiente paso: primera lección no completada (o módulo de refuerzo si hay fallos)
  if (needsRefinement) {
    const firstLessonOfModule = (lessonsByModule[needsRefinement] ?? [])[0] ?? null;
    nextStep = {
      type: "refinement",
      moduleId: needsRefinement,
      lessonId: firstLessonOfModule,
      label: "Refuerzo antes de seguir",
    };
    reason = "Te sugerimos repasar este módulo antes de continuar.";
  } else {
    for (const p of moduleProgress) {
      if (p.complete) continue;
      const lessonIds = lessonsByModule[p.moduleId] ?? [];
      const firstIncomplete = lessonIds.find((lid) => !completedSet.has(lid));
      nextStep = {
        type: firstIncomplete ? "lesson" : "module",
        moduleId: p.moduleId,
        lessonId: firstIncomplete ?? null,
        label: firstIncomplete ? "Siguiente lección" : "Siguiente módulo",
      };
      if (!reason) reason = "Tu próximo paso recomendado.";
      break;
    }
  }

  return {
    suggestedModuleOrder: suggestedOrder,
    nextStep,
    reason,
  };
}

/**
 * Estado de competencia por módulo para el mapa de skills.
 */
export type SkillState = "developed" | "in_progress" | "pending";

export interface ModuleSkill {
  moduleId: string;
  title: string;
  state: SkillState;
  completedLessons: number;
  totalLessons: number;
}

export function getModuleSkills(
  modules: { id: string; title: string }[],
  lessonsByModule: Record<string, string[]>,
  completedLessonIds: string[]
): ModuleSkill[] {
  const completedSet = new Set(completedLessonIds);
  return modules.map((m) => {
    const lessonIds = lessonsByModule[m.id] ?? [];
    const completed = lessonIds.filter((id) => completedSet.has(id)).length;
    const total = lessonIds.length;
    let state: SkillState = "pending";
    if (total > 0) {
      if (completed >= total) state = "developed";
      else if (completed > 0) state = "in_progress";
    }
    return {
      moduleId: m.id,
      title: m.title,
      state,
      completedLessons: completed,
      totalLessons: total,
    };
  });
}

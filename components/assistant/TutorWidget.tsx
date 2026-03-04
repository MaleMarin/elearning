"use client";

import type { LessonContext } from "@/lib/types/database";

interface TutorWidgetProps {
  lessonContext: LessonContext;
  onOpenAssistant?: () => void;
}

export function TutorWidget({ lessonContext, onOpenAssistant }: TutorWidgetProps) {
  return (
    <div className="card-white p-4 text-base">
      <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
        Pregúntale al Tutor
      </h3>
      <p className="text-[var(--text-muted)] mb-4">
        ¿Dudas sobre <strong>{lessonContext.lessonTitle}</strong>? Abre el
        asistente y pregunta. También puedes pedir un mini-quiz.
      </p>
      <button
        type="button"
        onClick={onOpenAssistant}
        className="btn-primary"
        style={{ minHeight: "48px" }}
      >
        Abrir tutor
      </button>
    </div>
  );
}

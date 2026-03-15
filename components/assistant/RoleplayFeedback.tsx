"use client";

interface RoleplayFeedbackProps {
  scenarioTitle: string;
  feedbackText: string;
  turnCount: number;
  onClose: () => void;
}

/**
 * Muestra el feedback estructurado del bot tras finalizar un roleplay
 * (qué hizo bien, qué faltó, sugerencia para la próxima práctica).
 */
export function RoleplayFeedback({
  scenarioTitle,
  feedbackText,
  turnCount,
  onClose,
}: RoleplayFeedbackProps) {
  return (
    <div className="p-4 overflow-y-auto flex flex-col gap-4">
      <p className="text-sm text-[var(--ink-muted)]">
        Escenario: <strong className="text-[var(--ink)]">{scenarioTitle}</strong>
        {turnCount > 0 && (
          <> · {turnCount} {turnCount === 1 ? "turno" : "turnos"} de conversación</>
        )}
      </p>
      <div className="rounded-xl border border-[var(--line)] bg-white p-4">
        <h3 className="text-sm font-semibold text-[var(--ink)] mb-2">Feedback</h3>
        <p className="whitespace-pre-wrap text-[var(--ink)] text-base leading-relaxed">
          {feedbackText}
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="btn-primary self-start"
      >
        Cerrar
      </button>
    </div>
  );
}

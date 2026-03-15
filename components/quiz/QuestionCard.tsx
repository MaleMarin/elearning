"use client";

import type { Question } from "@/lib/services/quiz";

interface QuestionCardProps {
  question: Question;
  step: number;
  total: number;
  selected: string | number | null;
  onSelect: (value: string | number) => void;
  disabled?: boolean;
}

export function QuestionCard({ question, step, total, selected, onSelect, disabled }: QuestionCardProps) {
  const progressPct = total ? ((step + 1) / total) * 100 : 0;
  const isMultiple = question.type === "multiple_choice" || question.type === "true_false";

  return (
    <div className="card-premium p-6 max-w-lg mx-auto">
      <div className="mb-4">
        <div className="h-2 rounded-full bg-[var(--line)] overflow-hidden">
          <div
            className="h-full bg-[var(--primary)] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Pregunta {step + 1} de {total}
        </p>
      </div>
      <h2 className="heading-section mb-4">{question.question}</h2>
      {isMultiple && question.options.length > 0 && (
        <ul className="space-y-2 list-none p-0 m-0">
          {question.options.map((opt, i) => {
            const isSelected = selected === i || selected === opt;
            return (
              <li key={i} className="mb-2.5">
                <button
                  type="button"
                  onClick={() => !disabled && onSelect(question.options?.length ? i : opt)}
                  disabled={disabled}
                  className={`quiz-option w-full text-left ${isSelected ? "selected" : ""}`}
                  aria-selected={isSelected}
                  style={{
                    background: "var(--neu-bg)",
                    border: "none",
                    borderRadius: "12px",
                    padding: "14px 18px",
                    cursor: disabled ? "not-allowed" : "pointer",
                    fontFamily: "var(--font)",
                    fontSize: "13px",
                    color: isSelected ? "var(--azul)" : "#4b5563",
                    fontWeight: isSelected ? 600 : 400,
                    boxShadow: isSelected
                      ? "inset 4px 4px 8px rgba(174,183,194,0.55), inset -4px -4px 8px rgba(255,255,255,0.8)"
                      : "4px 4px 8px rgba(174,183,194,0.55), -4px -4px 8px rgba(255,255,255,0.8)",
                    transition: "box-shadow 0.15s",
                  }}
                >
                  {opt}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {question.type === "short_answer" && (
        <input
          type="text"
          value={typeof selected === "string" ? selected : ""}
          onChange={(e) => onSelect(e.target.value)}
          disabled={disabled}
          placeholder="Escribe tu respuesta"
          className="w-full px-4 py-3 rounded-xl border border-[var(--line)] text-[var(--ink)]"
        />
      )}
    </div>
  );
}

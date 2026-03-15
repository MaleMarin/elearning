"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, MessageCircle } from "lucide-react";
import { AssistantChat } from "@/components/assistant/AssistantChat";
import type { RoleplayContext } from "@/components/assistant/AssistantChat";
import { RoleplayFeedback } from "@/components/assistant/RoleplayFeedback";
import type { LLMProvider } from "@/lib/ai/providers";

export interface RoleplayScenario {
  id: string;
  title: string;
  characterPrompt: string;
  openingLine: string;
  order?: number;
}

interface RoleplayLauncherProps {
  /** Si true, se muestra como modal; si false, inline (p. ej. dentro de una lección). */
  asModal?: boolean;
  onClose?: () => void;
  /** Contexto de lección/módulo para mostrar en la cabecera (opcional). */
  lessonName?: string;
  moduleName?: string;
}

/** Modo demo: escenarios de ejemplo sin API. */
const DEMO_SCENARIOS: RoleplayScenario[] = [
  {
    id: "convence-jefe",
    title: "Convence a tu jefe de adoptar una innovación",
    characterPrompt: "Eres el jefe directo del alumno. Eres escéptico ante los cambios y priorizas el riesgo operativo.",
    openingLine: "Entiendo que quieres proponer algo distinto, pero aquí las cosas siempre se han hecho así. ¿Qué tienes en mente?",
    order: 0,
  },
  {
    id: "resistencia-equipo",
    title: "Gestiona la resistencia al cambio de tu equipo",
    characterPrompt: "Eres un miembro del equipo que resiste el cambio. Tienes miedo a lo nuevo y te aferras a los procesos actuales.",
    openingLine: "Otra vez con cambios. Ya hemos intentado cosas antes y no funcionaron. ¿Por qué esta vez sería distinto?",
    order: 1,
  },
  {
    id: "presenta-ministerio",
    title: "Presenta un proyecto de innovación al Ministerio",
    characterPrompt: "Eres una autoridad del Ministerio, con poco tiempo y muchas demandas. Eres formal pero dispuesto a escuchar si la propuesta es clara.",
    openingLine: "Tengo 10 minutos. ¿Qué proyecto quieres presentar y cuál es el resultado concreto que buscan?",
    order: 2,
  },
  {
    id: "negocia-recursos",
    title: "Negocia recursos para tu iniciativa",
    characterPrompt: "Eres quien asigna presupuesto. Tienes restricciones y otras prioridades. Escuchas pero pides justificación.",
    openingLine: "Recursos siempre faltan. ¿Cuánto necesitas, para qué exactamente y qué pasaría si te damos la mitad?",
    order: 3,
  },
];

export function RoleplayLauncher({
  asModal = true,
  onClose,
  lessonName,
  moduleName,
}: RoleplayLauncherProps) {
  const [scenarios, setScenarios] = useState<RoleplayScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<RoleplayScenario | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; turnCount: number; scenarioTitle: string; scenarioId: string } | null>(null);
  const [provider, setProvider] = useState<LLMProvider>("anthropic");
  const userTurnCountRef = useRef(0);
  const pendingFeedbackRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/roleplay/scenarios")
      .then((r) => r.json())
      .then((data: { scenarios?: RoleplayScenario[] }) => {
        if (cancelled) return;
        setScenarios(Array.isArray(data.scenarios) && data.scenarios.length > 0 ? data.scenarios : DEMO_SCENARIOS);
      })
      .catch(() => {
        if (!cancelled) setScenarios(DEMO_SCENARIOS);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    fetch("/api/assistant")
      .then((r) => r.json())
      .then((data: { providers?: LLMProvider[] }) => {
        const list = data.providers ?? [];
        if (list.length > 0 && !list.includes(provider)) setProvider(list[0]);
      })
      .catch(() => {});
  }, [provider]);

  const roleplayContext: RoleplayContext | null = selected
    ? {
        scenarioId: selected.id,
        scenarioTitle: selected.title,
        characterPrompt: selected.characterPrompt,
        openingLine: selected.openingLine,
      }
    : null;

  const handleUserMessage = useCallback(() => {
    userTurnCountRef.current += 1;
  }, []);

  const handleAssistantMessage = useCallback(
    (text: string) => {
      if (!pendingFeedbackRef.current || !selected) return;
      setFeedback({
        text,
        turnCount: userTurnCountRef.current,
        scenarioTitle: selected.title,
        scenarioId: selected.id,
      });
      pendingFeedbackRef.current = false;
      fetch("/api/roleplay/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: selected.id,
          scenarioTitle: selected.title,
          turnCount: userTurnCountRef.current,
          feedback: text,
        }),
      }).catch(() => {});
    },
    [selected]
  );

  const handleExitRoleplayClick = useCallback(() => {
    pendingFeedbackRef.current = true;
  }, []);

  const handleCloseFeedback = useCallback(() => {
    setFeedback(null);
    setSelected(null);
    userTurnCountRef.current = 0;
    onClose?.();
  }, [onClose]);

  const content = (
    <>
      <div className="flex items-center justify-between gap-2 p-4 border-b border-[var(--line)] bg-white">
        <h2 id="roleplay-dialog-title" className="text-xl font-semibold text-[var(--ink)]">
          {feedback ? "Feedback del roleplay" : selected ? "Practicar con el escenario" : "Practicar con un escenario"}
        </h2>
        <button
          type="button"
          onClick={() => (feedback ? handleCloseFeedback() : selected ? setSelected(null) : onClose?.())}
          className="p-2 rounded-xl hover:bg-[var(--cream)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--ink-muted)]"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {feedback ? (
        <RoleplayFeedback
          scenarioTitle={feedback.scenarioTitle}
          feedbackText={feedback.text}
          turnCount={feedback.turnCount}
          onClose={handleCloseFeedback}
        />
      ) : selected ? (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="px-4 py-2 border-b border-[var(--line)] bg-[var(--cream)]">
            <p className="text-sm text-[var(--ink-muted)]">
              <strong className="text-[var(--ink)]">{selected.title}</strong>
              {lessonName && <> · {lessonName}</>}
            </p>
          </div>
          <div className="flex-1 min-h-0 flex flex-col">
            <AssistantChat
              mode="roleplay"
              lessonContext={null}
              roleplayContext={roleplayContext}
              provider={provider}
              onAssistantMessage={handleAssistantMessage}
              onExitRoleplayClick={handleExitRoleplayClick}
              onUserMessage={handleUserMessage}
              quickSuggestions={["FINALIZAR_ROLEPLAY", "Finalizar roleplay", "Salir del escenario"]}
            />
          </div>
        </div>
      ) : (
        <div className="p-4 overflow-y-auto">
          {loading ? (
            <p className="text-[var(--text-muted)]">Cargando escenarios…</p>
          ) : (
            <div className="grid gap-3">
              <p className="text-[var(--text-muted)] mb-2">
                Elige un escenario. El bot adoptará el personaje y podrás practicar la conversación (5-10 turnos). Al terminar, usa «Salir del escenario» para recibir feedback.
              </p>
              {scenarios.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelected(s)}
                  className="flex items-start gap-3 w-full text-left p-4 rounded-xl border border-[var(--line)] bg-white hover:bg-[var(--cream)] hover:border-[var(--primary)]/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                >
                  <MessageCircle className="w-5 h-5 shrink-0 text-[var(--primary)] mt-0.5" aria-hidden />
                  <span className="font-medium text-[var(--ink)]">{s.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );

  if (asModal) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] backdrop-blur-sm p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="roleplay-dialog-title"
      >
        <div
          className="w-full max-w-lg max-h-[90vh] flex flex-col bg-[var(--cream)] rounded-2xl shadow-xl overflow-hidden"
          style={{ boxShadow: "0 0 0 1px rgba(31,36,48,0.06), 0 16px 48px rgba(31,36,48,0.12)" }}
        >
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white overflow-hidden shadow-sm">
      {content}
    </div>
  );
}

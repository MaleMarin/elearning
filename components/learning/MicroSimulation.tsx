"use client";

import { useState } from "react";
import { SurfaceCard } from "@/components/ui";
import type { MicroSimulation as SimType, SimulationOption } from "@/lib/services/simulations";

interface MicroSimulationProps {
  simulation: SimType;
  onReflectionWithBot?: (reflectionPrompt: string) => void;
}

/**
 * Bloque de micro-simulación: escenario, opciones una a la vez con transición, resultado y reflexión.
 */
export function MicroSimulation({ simulation, onReflectionWithBot }: MicroSimulationProps) {
  const [step, setStep] = useState<"scenario" | "options" | "outcome" | "reflection">("scenario");
  const [selectedOption, setSelectedOption] = useState<SimulationOption | null>(null);
  const [optionIndex, setOptionIndex] = useState(0);

  const options = simulation.options?.length ? simulation.options : [];
  const currentOption = options[optionIndex] ?? null;
  const reflection = simulation.reflection?.trim() ?? "";

  const handleNextOption = () => {
    if (optionIndex < options.length - 1) {
      setOptionIndex((i) => i + 1);
    } else {
      setStep("reflection");
    }
  };

  const handleSelectOption = (opt: SimulationOption) => {
    setSelectedOption(opt);
    setStep("outcome");
  };

  const handleShowReflection = () => {
    setStep("reflection");
  };

  const handleAskBot = () => {
    if (reflection && onReflectionWithBot) onReflectionWithBot(reflection);
  };

  return (
    <SurfaceCard padding="lg" clickable={false} className="micro-simulation">
      <div className="space-y-6">
        {/* Paso 1: Escenario */}
        {(step === "scenario" || step === "options" || step === "outcome" || step === "reflection") && (
          <div className="animate-in fade-in duration-300">
            <h3 className="text-sm font-semibold text-[var(--ink-muted)] uppercase tracking-wide mb-2">
              Micro-simulación
            </h3>
            <p className="text-[var(--ink)] leading-relaxed whitespace-pre-wrap">{simulation.scenario}</p>
          </div>
        )}

        {/* Paso 2: Opciones una a la vez */}
        {step === "scenario" && (
          <div className="animate-in fade-in duration-300">
            <button
              type="button"
              onClick={() => setStep("options")}
              className="btn-primary"
            >
              Ver opciones
            </button>
          </div>
        )}

        {step === "options" && currentOption && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
            <p className="text-sm font-medium text-[var(--ink)]">Elige una opción:</p>
            <button
              type="button"
              onClick={() => handleSelectOption(currentOption)}
              className="w-full text-left px-4 py-3 rounded-xl border border-[var(--line)] bg-white hover:bg-[var(--cream)] hover:border-[var(--primary)] transition-colors text-[var(--ink)]"
            >
              {currentOption.text}
            </button>
            {options.length > 1 && (
              <div className="flex gap-2 justify-end">
                {optionIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => setOptionIndex((i) => i - 1)}
                    className="text-sm text-[var(--primary)] hover:underline"
                  >
                    Anterior
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNextOption}
                  className="text-sm text-[var(--primary)] hover:underline"
                >
                  {optionIndex < options.length - 1 ? "Siguiente opción" : "Ir a reflexión"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Paso 3: Consecuencia */}
        {step === "outcome" && selectedOption && (
          <div className="animate-in fade-in duration-300 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-4">
            <p className="text-sm font-medium text-[var(--ink-muted)] mb-1">Consecuencia</p>
            <p className="text-[var(--ink)]">{selectedOption.outcome}</p>
            <button type="button" onClick={handleShowReflection} className="btn-primary mt-4">
              Reflexionar
            </button>
          </div>
        )}

        {/* Paso 4: Reflexión */}
        {step === "reflection" && (
          <div className="animate-in fade-in duration-300 rounded-xl border border-[var(--primary)]/20 bg-white p-4">
            <p className="text-sm font-semibold text-[var(--ink)] mb-2">Reflexión</p>
            <p className="text-[var(--ink)] mb-4">{reflection || "¿Qué habrías hecho distinto?"}</p>
            {onReflectionWithBot && (
              <button type="button" onClick={handleAskBot} className="btn-primary">
                Hablar con el asistente sobre esto
              </button>
            )}
          </div>
        )}
      </div>
    </SurfaceCard>
  );
}

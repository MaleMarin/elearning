"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

export interface OnboardingData {
  profile?: { institution?: string };
  diagnosticCompleted?: boolean;
  lessonsCompleted?: number;
  pushEnabled?: boolean;
  whatsappOptIn?: boolean;
  postsCount?: number;
}

const STEPS = [
  {
    id: "perfil",
    icon: "👤",
    title: "Completa tu perfil",
    desc: "Agrega tu institución y cargo",
    href: "/perfil",
    done: (d: OnboardingData) => !!d.profile?.institution,
  },
  {
    id: "diagnostico",
    icon: "📋",
    title: "Haz el diagnóstico inicial",
    desc: "5 preguntas sobre tu experiencia",
    href: "/onboarding/diagnostic",
    done: (d: OnboardingData) => !!d.diagnosticCompleted,
  },
  {
    id: "primera_leccion",
    icon: "📚",
    title: "Empieza tu primera lección",
    desc: "El primer paso del programa",
    href: "/curso",
    done: (d: OnboardingData) => (d.lessonsCompleted ?? 0) > 0,
  },
  {
    id: "recordatorios",
    icon: "🔔",
    title: "Activa recordatorios",
    desc: "WhatsApp o push para no olvidar",
    href: "/perfil#notificaciones",
    done: (d: OnboardingData) => !!d.whatsappOptIn || !!d.pushEnabled,
  },
  {
    id: "comunidad",
    icon: "💬",
    title: "Preséntate en la comunidad",
    desc: "Di hola a tus compañeros",
    href: "/comunidad",
    done: (d: OnboardingData) => (d.postsCount ?? 0) > 0,
  },
];

interface OnboardingStepsProps {
  data: OnboardingData;
  userId?: string;
}

export function OnboardingSteps({ data, userId }: OnboardingStepsProps) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !userId) return;
    const key = `onboarding_hidden_${userId}`;
    setHidden(localStorage.getItem(key) === "1");
  }, [userId]);

  const doneCount = STEPS.filter((s) => s.done(data)).length;
  const allDone = doneCount >= STEPS.length;

  if (hidden || allDone) return null;

  return (
    <section
      className="rounded-2xl p-5 sm:p-6 shadow-[var(--shadow-card-inset),var(--shadow-card)] bg-[var(--surface)] border-0"
      aria-label="Pasos de inicio"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[var(--ink)]">Tu primer semana</h2>
        <span className="text-xs font-medium text-[var(--ink-muted)]">
          {doneCount}/5 completados
        </span>
      </div>
      <ol className="space-y-3">
        {STEPS.map((step) => {
          const isDone = step.done(data);
          return (
            <li key={step.id}>
              <Link
                href={step.href}
                className={`flex items-center gap-3 p-3 rounded-xl no-underline transition-all ${
                  isDone
                    ? "bg-[var(--surface-soft)] text-[var(--ink-muted)]"
                    : "bg-[var(--neu-bg)] shadow-[var(--neu-shadow-out-sm)] text-[var(--ink)] hover:shadow-[var(--neu-shadow-out)]"
                }`}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base"
                  style={{
                    background: isDone ? "var(--acento-soft)" : "var(--neu-bg)",
                    boxShadow: isDone ? "none" : "var(--neu-shadow-in-sm)",
                  }}
                >
                  {isDone ? <Check className="w-5 h-5 text-[var(--acento)]" /> : step.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`font-medium text-sm ${isDone ? "line-through" : ""}`}>{step.title}</p>
                  <p className="text-xs text-[var(--ink-muted)]">{step.desc}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
      <button
        type="button"
        onClick={() => {
          if (userId && typeof window !== "undefined") {
            localStorage.setItem(`onboarding_hidden_${userId}`, "1");
            setHidden(true);
          }
        }}
        className="mt-3 text-xs text-[var(--ink-muted)] hover:text-[var(--ink)]"
      >
        Ocultar pasos
      </button>
    </section>
  );
}

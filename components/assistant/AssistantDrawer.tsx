"use client";

import { useState, useCallback, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { AssistantChat } from "./AssistantChat";
import type { AssistantMode } from "@/lib/types/database";
import type { LessonContext } from "@/lib/types/database";
import type { LLMProvider } from "@/lib/ai/providers";

const STORAGE_KEY = "preferred_llm";

type TabId = "tutor" | "support" | "community";

const TABS: { id: TabId; label: string }[] = [
  { id: "tutor", label: "Tutor" },
  { id: "support", label: "Soporte" },
  { id: "community", label: "Comunidad" },
];

/** Sugerencias rápidas según contexto (Mayer / Nielsen). */
export const QUICK_SUGGESTIONS: Record<string, string[]> = {
  lesson: [
    "¿De qué trata esta lección?",
    "No entendí este concepto",
    "¿Qué sigue después de esto?",
    "Dame un ejemplo práctico",
  ],
  course: [
    "¿Por dónde empiezo?",
    "¿Cuánto me falta para terminar?",
    "¿Cuál es el módulo más importante?",
  ],
  admin: [
    "Generar estructura de curso",
    "Crear guion instruccional",
    "Armar encuesta Kirkpatrick",
    "¿Cómo va el progreso del curso?",
  ],
  module_complete: [
    "¿Qué aprendí en este módulo?",
    "¿Qué módulo sigue?",
    "¿Cuánto me falta para el certificado?",
  ],
  quiz_failed: [
    "¿Qué debo repasar?",
    "¿Cuándo puedo reintentar?",
    "Explícame el concepto que fallé",
  ],
};

const PROVIDER_LABELS: Record<LLMProvider, string> = {
  anthropic: "Claude (Anthropic)",
  openai: "GPT-4o (OpenAI)",
  google: "Gemini Flash (Google)",
};

function ProviderSelect({
  providers,
  value,
  onChange,
}: {
  providers: LLMProvider[];
  value: LLMProvider;
  onChange: (p: LLMProvider) => void;
}) {
  const [open, setOpen] = useState(false);
  const label = PROVIDER_LABELS[value] ?? value;
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--cream)] text-sm text-[var(--ink)] hover:bg-[var(--cream)]/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Modelo de IA"
      >
        <span className="max-w-[140px] truncate">{label}</span>
        <ChevronDown className="w-4 h-4 shrink-0 text-[var(--ink-muted)]" />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <ul
            role="listbox"
            className="absolute right-0 top-full mt-1 z-50 min-w-[180px] py-1 rounded-xl border border-[var(--line)] bg-white shadow-lg"
          >
            {providers.map((p) => (
              <li key={p} role="option" aria-selected={value === p}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(p);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm ${
                    value === p ? "bg-[var(--cream)] text-[var(--primary)]" : "text-[var(--ink)] hover:bg-[var(--cream)]/50"
                  }`}
                >
                  {PROVIDER_LABELS[p] ?? p}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

interface AssistantDrawerProps {
  defaultMode?: AssistantMode;
  lessonContext?: LessonContext | null;
  cohortId?: string | null;
  courseId?: string | null;
  open?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

export function AssistantDrawer({
  defaultMode = "tutor",
  lessonContext = null,
  cohortId = null,
  courseId = null,
  open: controlledOpen,
  onClose,
  onOpen,
}: AssistantDrawerProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = useCallback(
    (v: boolean) => {
      if (isControlled) (v ? onOpen?.() : onClose?.());
      else setInternalOpen(v);
    },
    [isControlled, onOpen, onClose]
  );

  const [activeTab, setActiveTab] = useState<TabId>(
    defaultMode === "roleplay" ? "tutor" : defaultMode
  );
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState<string>("");
  const [provider, setProvider] = useState<LLMProvider>(() => {
    if (typeof window === "undefined") return "anthropic";
    const stored = window.localStorage.getItem(STORAGE_KEY) as LLMProvider | null;
    return stored && ["anthropic", "openai", "google"].includes(stored) ? stored : "anthropic";
  });

  useEffect(() => {
    setActiveTab(defaultMode === "roleplay" ? "tutor" : defaultMode);
  }, [defaultMode]);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { role?: string; full_name?: string } | null) => {
        if (data) {
          setIsAdmin(data.role === "admin");
          setUserDisplayName((data.full_name as string)?.trim() || "");
        }
      })
      .catch(() => setIsAdmin(false));
  }, []);

  useEffect(() => {
    fetch("/api/assistant", { method: "GET", credentials: "include" })
      .then((r) => (r.ok ? r.json() : { providers: [] }))
      .then((data: { providers?: LLMProvider[] }) => setProviders(data?.providers ?? []))
      .catch(() => setProviders([]));
  }, []);

  const handleProviderChange = useCallback((p: LLMProvider) => {
    setProvider(p);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, p);
  }, []);

  const showProviderSelector = providers.length > 1;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-[var(--overlay)] backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="assistant-dialog-title"
        >
          <div
            className="w-full max-w-lg flex flex-col h-full bg-[var(--neu-bg)] rounded-l-2xl"
            style={{
              fontSize: "18px",
              boxShadow: "var(--neu-shadow-out), -4px 0 24px rgba(31,36,48,0.08)",
            }}
          >
            <div className="flex items-center justify-between gap-2 p-4 rounded-tl-2xl bg-[var(--neu-bg)] shrink-0" style={{ boxShadow: "var(--neu-shadow-in-sm)" }}>
              <h2 id="assistant-dialog-title" className="text-xl font-semibold text-[var(--azul)] shrink-0 flex items-center gap-2">
                {userDisplayName ? `Hola soy PD, ¿cómo estás ${userDisplayName}?` : "Hola soy PD"}
                {isAdmin && (
                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#00e5a0",
                      background: "rgba(0,229,160,0.1)",
                      padding: "2px 8px",
                      borderRadius: "10px",
                    }}
                  >
                    Modo Admin
                  </span>
                )}
              </h2>
              {showProviderSelector && (
                <ProviderSelect
                  providers={providers}
                  value={provider}
                  onChange={handleProviderChange}
                />
              )}
              <button
                type="button"
                onClick={() => { onClose?.(); if (!isControlled) setInternalOpen(false); }}
                className="p-2 rounded-xl hover:bg-[var(--cream)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--ink-muted)]"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-1 px-2 py-2 bg-[var(--neu-bg)]" style={{ boxShadow: "var(--neu-shadow-in-sm)" }}>
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 px-4 font-medium rounded-xl min-h-[48px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--acento)] ${
                    activeTab === tab.id
                      ? "text-[var(--azul)] bg-[var(--neu-bg)]"
                      : "text-[var(--ink-muted)] hover:text-[var(--ink)] bg-[var(--neu-bg)]"
                  }`}
                  style={{
                    boxShadow: activeTab === tab.id ? "var(--neu-shadow-in)" : "var(--neu-shadow-out-sm)",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-[var(--neu-bg)]">
              <div className="flex-1 overflow-auto">
                <AssistantChat
                  mode={activeTab}
                  lessonContext={activeTab === "tutor" ? lessonContext : null}
                  cohortId={cohortId}
                  courseId={courseId}
                  provider={provider}
                  onClose={() => setOpen(false)}
                  quickSuggestions={
                    activeTab === "tutor"
                      ? lessonContext
                        ? QUICK_SUGGESTIONS.lesson
                        : QUICK_SUGGESTIONS.course
                      : []
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

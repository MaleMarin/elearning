"use client";

import { useState, useCallback, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { AssistantChat } from "./AssistantChat";
import type { AssistantMode } from "@/lib/types/database";
import type { LessonContext } from "@/lib/types/database";

type TabId = "tutor" | "support" | "community";

const TABS: { id: TabId; label: string }[] = [
  { id: "tutor", label: "Tutor" },
  { id: "support", label: "Soporte" },
  { id: "community", label: "Comunidad" },
];

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

  const [activeTab, setActiveTab] = useState<TabId>(defaultMode);
  useEffect(() => {
    setActiveTab(defaultMode);
  }, [defaultMode]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center text-white transition-all duration-200 bg-[var(--primary)] border border-[var(--line-subtle)] elevation-2 hover:translateY(-1px) hover-elevation-3 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/40"
        aria-label="Abrir asistente (Tutor, Soporte, Comunidad)"
      >
        <MessageCircle className="w-7 h-7" strokeWidth={2} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Panel del asistente"
        >
          <div
            className="w-full max-w-lg bg-[var(--cream)] flex flex-col h-full"
            style={{
              fontSize: "18px",
              boxShadow: "0 0 0 1px rgba(31,36,48,0.06), -8px 0 32px rgba(31,36,48,0.12), -2px 0 8px rgba(31,36,48,0.06)",
            }}
          >
            <div className="flex items-center justify-between p-4 border-b border-[var(--line)] bg-white rounded-t-2xl shadow-[0_1px_0_0_rgba(255,255,255,0.9)_inset]">
              <h2 className="text-xl font-semibold text-[var(--ink)]">
                Asistente
              </h2>
              <button
                type="button"
                onClick={() => { onClose?.(); if (!isControlled) setInternalOpen(false); }}
                className="p-2 rounded-xl hover:bg-[var(--cream)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--ink-muted)]"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex border-b border-[var(--line)] bg-white px-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 px-4 font-medium rounded-t-xl transition-colors min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--primary)] ${
                    activeTab === tab.id
                      ? "text-[var(--primary)] bg-[var(--cream)]"
                      : "text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--cream)]/50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-[var(--cream)]">
              <div className="flex-1 overflow-auto">
                <AssistantChat
                  mode={activeTab}
                  lessonContext={activeTab === "tutor" ? lessonContext : null}
                  cohortId={cohortId}
                  courseId={courseId}
                  onClose={() => setOpen(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { MessageCircle } from "lucide-react";
import { useAssistant } from "@/contexts/AssistantContext";

/**
 * Botón flotante del asistente, siempre visible abajo a la derecha.
 * Abre el panel del asistente (Tutor, Soporte, Comunidad).
 */
export function AssistantFab() {
  const { openDrawer } = useAssistant();

  return (
    <button
      type="button"
      onClick={() => openDrawer({})}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center text-white transition-all duration-200 bg-[var(--primary)] border border-[var(--line-subtle)] shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_6px_20px_rgba(31,36,48,0.18)] hover:translate-y-[-1px] hover:shadow-[0_2px_0_0_rgba(255,255,255,0.3)_inset,0_10px_28px_rgba(31,36,48,0.22)] focus:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/40 focus-visible:ring-offset-2"
      aria-label="Abrir asistente (Tutor, Soporte, Comunidad)"
    >
      <MessageCircle className="w-7 h-7" strokeWidth={2} />
    </button>
  );
}

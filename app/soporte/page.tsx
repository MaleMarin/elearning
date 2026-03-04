"use client";

import { useState, useEffect } from "react";
import { useAssistant } from "@/contexts/AssistantContext";
import { SUPPORT_FAQ } from "@/lib/ai/prompts/support";

export default function SoportePage() {
  const { openDrawer } = useAssistant();
  const [tickets, setTickets] = useState<Array<{ id: string; category: string; summary: string; status: string; created_at: string }>>([]);

  useEffect(() => {
    fetch("/api/support/tickets")
      .then((r) => r.json())
      .then((d) => (d.tickets ? setTickets(d.tickets) : []))
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-4">Ayuda</h1>

      <section className="card-white p-6 mb-6">
        <h2 className="text-lg font-semibold text-[var(--text)] mb-3">
          Preguntas frecuentes
        </h2>
        <ul className="space-y-4 text-base">
          {SUPPORT_FAQ.map((faq, i) => (
            <li key={i}>
              <p className="font-medium text-[var(--text)]">{faq.q}</p>
              <p className="text-[var(--text-muted)] mt-1">{faq.a}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="card-white p-6 mb-6">
        <h2 className="text-lg font-semibold text-[var(--text)] mb-3">
          Chat de soporte
        </h2>
        <p className="text-[var(--text-muted)] mb-4">
          Si no encuentras la respuesta, abre el chat y te ayudamos. Si hace falta, crearemos un ticket.
        </p>
        <button
          type="button"
          onClick={() => openDrawer({ mode: "support" })}
          className="btn-primary"
        >
          Abrir chat de soporte
        </button>
      </section>

      <section className="card-white p-6">
        <h2 className="text-lg font-semibold text-[var(--text)] mb-3">
          Mis tickets
        </h2>
        {tickets.length === 0 ? (
          <p className="text-[var(--text-muted)]">No tienes tickets aún.</p>
        ) : (
          <ul className="space-y-3">
            {tickets.map((t) => (
              <li
                key={t.id}
                className="border border-gray-200 rounded-lg p-3 text-base"
              >
                <span className="font-medium">{t.summary}</span>
                <span className="text-[var(--text-muted)] ml-2">
                  — {t.status} · {new Date(t.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useAssistant } from "@/contexts/AssistantContext";
import { SUPPORT_FAQ } from "@/lib/ai/prompts/support";

export default function SoportePage() {
  const { openDrawer } = useAssistant();
  const [tickets, setTickets] = useState<Array<{ id: string; category: string; summary: string; status: string; created_at: string }>>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/support/tickets")
      .then((r) => r.json())
      .then((d) => (d.tickets ? setTickets(d.tickets) : []))
      .catch(() => {});
  }, []);

  return (
    <div style={{ flex: 1, padding: "20px 20px", background: "#e8eaf0", minHeight: "100vh", fontFamily: "'Syne', sans-serif" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", marginBottom: 4 }}>Soporte</h1>
      <p style={{ fontSize: 13, color: "#8892b0", marginBottom: 24 }}>Ayuda y preguntas frecuentes</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{ background: "#e8eaf0", borderRadius: 18, padding: 20, boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff", cursor: "pointer" }}
          onClick={() => openDrawer({ mode: "support" })}
        >
          <p style={{ fontSize: 14, fontWeight: 700, color: "#0a0f8a", marginBottom: 4 }}>Hablar con el Bot PD</p>
          <p style={{ fontSize: 12, color: "#8892b0" }}>Abre el asistente para consultas rápidas.</p>
        </div>

        <div style={{ background: "#e8eaf0", borderRadius: 18, padding: 20, boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff" }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#0a0f8a", marginBottom: 4 }}>Reportar un problema</p>
          <p style={{ fontSize: 12, color: "#8892b0", marginBottom: 12 }}>Abre el chat de soporte y describe el problema; se creará un ticket.</p>
          <button
            type="button"
            onClick={() => openDrawer({ mode: "support" })}
            style={{ padding: "10px 18px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 700, background: "linear-gradient(135deg, #1428d4, #0a0f8a)", color: "white", boxShadow: "4px 4px 10px rgba(10,15,138,0.3)" }}
          >
            Abrir chat de soporte
          </button>
        </div>

        <div style={{ background: "#e8eaf0", borderRadius: 18, padding: 20, boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff" }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#0a0f8a", marginBottom: 14 }}>Preguntas frecuentes</p>
          {SUPPORT_FAQ.map((faq, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#0a0f8a",
                  background: "#e8eaf0",
                  boxShadow: openFaq === i ? "inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff" : "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff",
                }}
              >
                {faq.q}
              </button>
              {openFaq === i && (
                <p style={{ fontSize: 13, color: "#4a5580", lineHeight: 1.6, marginTop: 8, paddingLeft: 4 }}>{faq.a}</p>
              )}
            </div>
          ))}
        </div>

        <div style={{ background: "#e8eaf0", borderRadius: 18, padding: 20, boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff" }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#0a0f8a", marginBottom: 4 }}>Contactar facilitador</p>
          <p style={{ fontSize: 12, color: "#8892b0" }}>Usa el chat de soporte o el canal que tu grupo haya indicado.</p>
        </div>

        <div style={{ background: "#e8eaf0", borderRadius: 18, padding: 20, boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff" }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#0a0f8a", marginBottom: 12 }}>Mis tickets</p>
          {tickets.length === 0 ? (
            <p style={{ fontSize: 13, color: "#8892b0" }}>No tienes tickets aún.</p>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {tickets.map((t) => (
                <li key={t.id} style={{ padding: "10px 0", borderBottom: "1px solid rgba(194,200,214,0.3)" }}>
                  <span style={{ fontWeight: 600, color: "#0a0f8a" }}>{t.summary}</span>
                  <span style={{ fontSize: 12, color: "#8892b0", marginLeft: 8 }}>— {t.status} · {new Date(t.created_at).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

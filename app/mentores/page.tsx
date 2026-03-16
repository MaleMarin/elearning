"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MentorCard } from "@/components/community/MentorCard";

interface Mentor {
  userId: string;
  fullName: string;
  institution: string | null;
  position: string | null;
  photoURL: string | null;
  cohortName: string | null;
  createdAt: string;
}

export default function MentoresPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ mentorId: string; mentorName: string } | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/mentors", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setMentors(d.mentors ?? []))
      .catch(() => setMentors([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/mentors/my-requests", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        const ids = new Set<string>((d.requests ?? []).map((r: { mentorId: string }) => r.mentorId));
        setRequestedIds(ids);
      })
      .catch(() => {});
  }, []);

  const handleRequestClick = (mentorId: string) => {
    const m = mentors.find((x) => x.userId === mentorId);
    setModal(m ? { mentorId, mentorName: m.fullName } : null);
    setMessage("");
  };

  const handleSubmitRequest = async () => {
    if (!modal || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/mentors/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ mentorId: modal.mentorId, message: message.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setRequestedIds((prev) => new Set(prev).add(modal.mentorId));
      setModal(null);
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ flex: 1, padding: "20px 20px", background: "#e8eaf0", minHeight: "100vh", fontFamily: "var(--font-heading)" }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/inicio" style={{ fontSize: 13, color: "#8892b0", marginBottom: 8, display: "inline-block" }}>← Inicio</Link>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", letterSpacing: "-0.5px" }}>Mentores</h1>
        <p style={{ fontSize: 13, color: "#8892b0", marginTop: 4 }}>Egresados ofrecen una sesión de 30 min. Solicita una y el equipo coordinará la conexión.</p>
      </div>
      <div style={{ background: "#e8eaf0", borderRadius: 20, padding: 24, boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff" }}>
        {loading ? (
          <p style={{ fontSize: 13, color: "#8892b0" }}>Cargando…</p>
        ) : mentors.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#0a0f8a" }}>Los mentores aparecerán pronto</p>
          </div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
            {mentors.map((m) => (
              <li key={m.userId} style={{ background: "#e8eaf0", borderRadius: 16, padding: 18, boxShadow: "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff" }}>
                <MentorCard mentor={m} onRequest={handleRequestClick} requested={requestedIds.has(m.userId)} />
              </li>
            ))}
          </ul>
        )}
      </div>
      {modal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(10,15,138,0.2)" }} role="dialog" aria-modal="true">
          <div style={{ background: "#e8eaf0", borderRadius: 20, padding: 24, maxWidth: 400, width: "100%", boxShadow: "8px 8px 24px #c2c8d6, -8px -8px 24px #ffffff" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0a0f8a", marginBottom: 12 }}>Solicitar sesión con {modal.mentorName}</h2>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 500))}
              placeholder="Tema o duda (opcional)"
              rows={3}
              maxLength={500}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "none", background: "#e8eaf0", boxShadow: "inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff", fontSize: 13, color: "#0a0f8a", outline: "none", marginBottom: 16 }}
            />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setModal(null)} style={{ padding: "10px 18px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "var(--font-heading)", fontSize: 12, fontWeight: 600, background: "#e8eaf0", color: "#4a5580", boxShadow: "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff" }}>Cancelar</button>
              <button type="button" onClick={handleSubmitRequest} disabled={submitting} style={{ padding: "10px 18px", borderRadius: 12, border: "none", cursor: submitting ? "wait" : "pointer", fontFamily: "var(--font-heading)", fontSize: 12, fontWeight: 700, background: "linear-gradient(135deg, #1428d4, #0a0f8a)", color: "white", boxShadow: "4px 4px 10px rgba(10,15,138,0.3)" }}>{submitting ? "Enviando…" : "Enviar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";

interface Session {
  id: string;
  cohort_id: string;
  title: string;
  scheduled_at: string;
  meeting_url: string | null;
  youtube_id?: string | null;
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SesionesPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((d) => setSessions(d.sessions ?? []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date().toISOString();
  const proximas = sessions.filter((s) => s.scheduled_at >= now).sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
  const sesionesAnteriores = sessions.filter((s) => s.scheduled_at < now).sort((a, b) => b.scheduled_at.localeCompare(a.scheduled_at));
  const sesion = proximas[0] ?? null;

  if (loading) {
    return (
      <div style={{ flex: 1, padding: "20px", background: "#e8eaf0", minHeight: "100vh", fontFamily: "'Syne', sans-serif" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", marginBottom: 4 }}>Sesiones en vivo</h1>
        <p style={{ fontSize: 13, color: "#8892b0", marginBottom: 24 }}>Cargando…</p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, padding: "20px", background: "#e8eaf0", minHeight: "100vh", fontFamily: "'Syne', sans-serif" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", marginBottom: 4 }}>Sesiones en vivo</h1>
      <p style={{ fontSize: 13, color: "#8892b0", marginBottom: 24 }}>Clases en tiempo real con tu facilitador</p>

      <div
        style={{
          background: sesion ? "linear-gradient(135deg, #0a0f8a, #1428d4)" : "#e8eaf0",
          borderRadius: 20,
          padding: 28,
          marginBottom: 20,
          boxShadow: sesion
            ? "7px 7px 18px rgba(10,15,138,0.35), -4px -4px 12px rgba(255,255,255,0.6)"
            : "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
        }}
      >
        <p
          style={{
            fontSize: 10,
            color: sesion ? "rgba(255,255,255,0.6)" : "#8892b0",
            fontFamily: "'Space Mono', monospace",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            marginBottom: 8,
          }}
        >
          Próxima sesión
        </p>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: sesion ? "white" : "#0a0f8a", marginBottom: 6 }}>
          {sesion?.title ?? "Sin sesiones programadas"}
        </h2>
        <p style={{ fontSize: 13, color: sesion ? "rgba(255,255,255,0.7)" : "#8892b0", marginBottom: 20 }}>
          {sesion ? formatFecha(sesion.scheduled_at) : "Próximamente"}
        </p>
        {sesion?.meeting_url && (
          <a
            href={sesion.meeting_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "10px 24px",
              borderRadius: 50,
              border: "1.5px solid rgba(255,255,255,0.6)",
              color: "white",
              fontFamily: "'Syne', sans-serif",
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Entrar a la sesión →
          </a>
        )}
      </div>

      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#8892b0",
          textTransform: "uppercase",
          letterSpacing: "1.5px",
          fontFamily: "'Space Mono', monospace",
          marginBottom: 12,
        }}
      >
        Sesiones anteriores
      </p>
      {sesionesAnteriores.length === 0 ? (
        <div
          style={{
            background: "#e8eaf0",
            borderRadius: 16,
            padding: 24,
            textAlign: "center",
            boxShadow: "5px 5px 12px #c2c8d6, -5px -5px 12px #ffffff",
          }}
        >
          <p style={{ fontSize: 13, color: "#8892b0" }}>No hay sesiones anteriores aún.</p>
        </div>
      ) : (
        sesionesAnteriores.map((s) => (
          <div
            key={s.id}
            style={{
              background: "#e8eaf0",
              borderRadius: 14,
              padding: "14px 18px",
              marginBottom: 10,
              boxShadow: "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#0a0f8a" }}>{s.title}</p>
              <p style={{ fontSize: 11, color: "#8892b0", marginTop: 3, fontFamily: "'Space Mono', monospace" }}>{formatFecha(s.scheduled_at)}</p>
            </div>
            {(s as Session & { youtubeId?: string }).youtubeId && (
              <a
                href={`https://youtube.com/watch?v=${(s as Session & { youtubeId: string }).youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "6px 14px",
                  borderRadius: 10,
                  background: "#e8eaf0",
                  color: "#1428d4",
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  textDecoration: "none",
                  boxShadow: "3px 3px 7px #c2c8d6, -3px -3px 7px #ffffff",
                }}
              >
                Ver grabación
              </a>
            )}
          </div>
        ))
      )}
    </div>
  );
}

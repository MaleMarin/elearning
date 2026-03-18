"use client";

import { useState, useEffect } from "react";

interface Session {
  id: string;
  cohort_id: string;
  title: string;
  scheduled_at: string;
  meeting_url: string | null;
  youtube_id?: string | null;
  duration_minutes?: number | null;
  facilitator_name?: string | null;
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

function useCountdown(until: string | null): { days: number; hours: number; min: number; sec: number } | null {
  const [diff, setDiff] = useState<number | null>(null);
  useEffect(() => {
    if (!until) return setDiff(null);
    const update = () => {
      const d = new Date(until).getTime() - Date.now();
      setDiff(d <= 0 ? 0 : d);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [until]);
  if (diff === null || diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const min = Math.floor((diff % 3600000) / 60000);
  const sec = Math.floor((diff % 60000) / 1000);
  return { days, hours, min, sec };
}

function icsUrl(session: Session): string {
  const start = new Date(session.scheduled_at);
  const end = new Date(start.getTime() + (session.duration_minutes ?? 60) * 60000);
  const format = (d: Date) => d.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const title = encodeURIComponent(session.title);
  const href = `data:text/calendar;charset=utf-8,BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${format(start)}
DTEND:${format(end)}
SUMMARY:${session.title}
END:VEVENT
END:VCALENDAR`;
  return href;
}

export default function SesionesPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [asistencia, setAsistencia] = useState(0);

  useEffect(() => {
    fetch("/api/sessions", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setSessions(d.sessions ?? []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date().toISOString();
  const proximas = sessions.filter((s) => s.scheduled_at >= now).sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
  const sesionesAnteriores = sessions.filter((s) => s.scheduled_at < now).sort((a, b) => b.scheduled_at.localeCompare(a.scheduled_at));
  const proxima = proximas[0] ?? null;
  const countdown = useCountdown(proxima?.scheduled_at ?? null);
  const canEnter = proxima?.meeting_url && proxima.scheduled_at && new Date(proxima.scheduled_at).getTime() - Date.now() < 15 * 60 * 1000;

  const baseLayout = {
    flex: 1,
    padding: "24px 32px",
    background: "#e8eaf0",
    minHeight: "100vh",
    fontFamily: "'Raleway', sans-serif",
    maxWidth: 1100,
    margin: "0 auto",
    width: "100%",
  } as const;

  if (loading) {
    return (
      <div style={baseLayout}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", marginBottom: 4 }}>Sesiones en vivo</h1>
        <p style={{ fontSize: 13, color: "#8892b0", marginBottom: 24 }}>Cargando…</p>
      </div>
    );
  }

  return (
    <div style={baseLayout}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", marginBottom: 4 }}>Sesiones en vivo</h1>
      <p style={{ fontSize: 13, color: "#8892b0", marginBottom: 24 }}>Clases en tiempo real con tu facilitador</p>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 65%", minWidth: 280 }}>
          <div
            style={{
              background: proxima ? "linear-gradient(135deg, #0a0f8a, #1428d4)" : "#e8eaf0",
              borderRadius: 20,
              padding: 28,
              marginBottom: 24,
              boxShadow: proxima
                ? "7px 7px 18px rgba(10,15,138,0.35), -4px -4px 12px rgba(255,255,255,0.6)"
                : "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
            }}
          >
            <p
              style={{
                fontSize: 10,
                color: proxima ? "rgba(255,255,255,0.6)" : "#8892b0",
                fontFamily: "'Space Mono', monospace",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                marginBottom: 8,
              }}
            >
              Próxima sesión
            </p>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: proxima ? "white" : "#0a0f8a", marginBottom: 6 }}>
              {proxima?.title ?? "Sin sesiones programadas"}
            </h2>
            {proxima?.facilitator_name && (
              <p style={{ fontSize: 12, color: proxima ? "rgba(255,255,255,0.8)" : "#8892b0", marginBottom: 8 }}>{proxima.facilitator_name}</p>
            )}
            <p style={{ fontSize: 13, color: proxima ? "rgba(255,255,255,0.7)" : "#8892b0", marginBottom: 16 }}>
              {proxima ? formatFecha(proxima.scheduled_at) : "Próximamente"}
            </p>
            {countdown && (
              <p
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#00e5a0",
                  fontFamily: "'Space Mono', monospace",
                  marginBottom: 20,
                  letterSpacing: "2px",
                }}
              >
                {countdown.days}d {countdown.hours}h {countdown.min}m {countdown.sec}s
              </p>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {proxima?.meeting_url && (
                <a
                  href={canEnter ? proxima.meeting_url : "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    padding: "12px 24px",
                    borderRadius: 14,
                    border: "none",
                    fontFamily: "'Raleway', sans-serif",
                    fontSize: 13,
                    fontWeight: 700,
                    background: canEnter ? "#00e5a0" : "rgba(255,255,255,0.2)",
                    color: canEnter ? "#0a0f8a" : "white",
                    textDecoration: "none",
                    cursor: canEnter ? "pointer" : "default",
                    boxShadow: canEnter ? "4px 4px 12px rgba(0,229,160,0.3)" : "none",
                  }}
                >
                  {canEnter ? "Entrar a la sesión →" : "Disponible 15 min antes"}
                </a>
              )}
              {proxima && (
                <a
                  href={icsUrl(proxima)}
                  download={`sesion-${proxima.id}.ics`}
                  style={{
                    display: "inline-block",
                    padding: "12px 24px",
                    borderRadius: 14,
                    border: "1.5px solid rgba(255,255,255,0.5)",
                    color: "white",
                    fontFamily: "'Raleway', sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: "none",
                    background: "transparent",
                  }}
                >
                  Agregar al calendario
                </a>
              )}
            </div>
          </div>

          <p style={{ fontSize: 11, fontWeight: 700, color: "#8892b0", textTransform: "uppercase", letterSpacing: "1.5px", fontFamily: "'Space Mono', monospace", marginBottom: 12 }}>
            Sesiones anteriores
          </p>
          {sesionesAnteriores.length === 0 ? (
            <div style={{ background: "#e8eaf0", borderRadius: 16, padding: 24, textAlign: "center", boxShadow: "5px 5px 12px #c2c8d6, -5px -5px 12px #ffffff" }}>
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
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#0a0f8a" }}>{s.title}</p>
                  <p style={{ fontSize: 11, color: "#8892b0", marginTop: 3, fontFamily: "'Space Mono', monospace" }}>{formatFecha(s.scheduled_at)}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {(s as Session & { youtubeId?: string }).youtube_id && (
                    <a
                      href={`https://youtube.com/watch?v=${(s as Session & { youtube_id: string }).youtube_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "6px 14px",
                        borderRadius: 10,
                        background: "#e8eaf0",
                        color: "#1428d4",
                        fontFamily: "'Raleway', sans-serif",
                        fontSize: 11,
                        fontWeight: 700,
                        textDecoration: "none",
                        boxShadow: "3px 3px 7px #c2c8d6, -3px -3px 7px #ffffff",
                      }}
                    >
                      Ver grabación
                    </a>
                  )}
                  {(s as Session & { vista?: boolean }).vista && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#00b87d", padding: "3px 8px", borderRadius: 20, background: "rgba(0,184,125,0.15)" }}>Vista</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ flex: "0 1 280px" }}>
          <div style={{ background: "#e8eaf0", borderRadius: 18, padding: 20, marginBottom: 20, boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#8892b0", fontFamily: "'Space Mono', monospace", marginBottom: 12 }}>Próximas 3 sesiones</p>
            {proximas.slice(0, 3).map((s) => (
              <div key={s.id} style={{ padding: "10px 0", borderBottom: "1px solid rgba(194,200,214,0.4)" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#0a0f8a" }}>{s.title}</p>
                <p style={{ fontSize: 10, color: "#8892b0", fontFamily: "'Space Mono', monospace", marginTop: 2 }}>{formatFecha(s.scheduled_at)}</p>
              </div>
            ))}
            {proximas.length === 0 && <p style={{ fontSize: 12, color: "#8892b0" }}>Sin sesiones programadas</p>}
          </div>
          <div style={{ background: "#e8eaf0", borderRadius: 18, padding: 20, boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#8892b0", fontFamily: "'Space Mono', monospace", marginBottom: 8 }}>Mi asistencia</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: "#1428d4", fontFamily: "'Space Mono', monospace" }}>{asistencia}</p>
            <p style={{ fontSize: 12, color: "#4a5580" }}>sesiones asistidas</p>
          </div>
        </div>
      </div>
    </div>
  );
}

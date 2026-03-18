"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const TIPOS: Record<string, { color: string; label: string }> = {
  quiz: { color: "#c89000", label: "Quiz" },
  sesion: { color: "#1428d4", label: "Sesión" },
  logro: { color: "#00b87d", label: "Logro" },
  tarea: { color: "#d84040", label: "Tarea" },
  sistema: { color: "#8892b0", label: "Sistema" },
  answer_to_question: { color: "#1428d4", label: "Comunidad" },
};

type Notif = {
  id: string;
  type?: string;
  title: string;
  description: string;
  createdAt: string;
  read?: boolean;
  href?: string;
};

function formatTiempo(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return "Ahora";
  if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`;
  if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)} h`;
  if (diff < 172800000) return "Ayer";
  if (diff < 604800000) return "Esta semana";
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

function grupoFecha(iso: string): "hoy" | "ayer" | "semana" | "antes" {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const ayer = new Date(today.getTime() - 86400000);
  const semana = new Date(today.getTime() - 7 * 86400000);
  const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (day.getTime() === today.getTime()) return "hoy";
  if (day.getTime() === ayer.getTime()) return "ayer";
  if (day.getTime() >= semana.getTime()) return "semana";
  return "antes";
}

const FILTROS = [
  { id: "todas", label: "Todas" },
  { id: "no-leidas", label: "No leídas" },
  { id: "quiz", label: "Quizzes" },
  { id: "sesion", label: "Sesiones" },
  { id: "logro", label: "Logros" },
  { id: "tarea", label: "Tareas" },
  { id: "sistema", label: "Sistema" },
] as const;

export default function NotificacionesPage() {
  const router = useRouter();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [filtro, setFiltro] = useState<string>("todas");
  const [loading, setLoading] = useState(true);
  const [marcandoTodas, setMarcandoTodas] = useState(false);

  useEffect(() => {
    fetch("/api/notifications?unreadOnly=false", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const list = (data.notifications ?? []).map((n: { id: string; type?: string; fromUserName?: string; lessonId?: string; postId?: string; read?: boolean; createdAt: string }) => ({
          id: n.id,
          type: n.type ?? "sistema",
          title: n.type === "answer_to_question" ? "Nueva respuesta" : "Notificación",
          description: n.type === "answer_to_question" ? `${n.fromUserName ?? "Alguien"} respondió tu pregunta.` : "Actualización del programa.",
          createdAt: n.createdAt,
          read: n.read ?? false,
          href: n.lessonId && n.postId ? `/curso/lecciones/${n.lessonId}#post-${n.postId}` : undefined,
        }));
        setNotifs(list);
      })
      .catch(() => setNotifs([]))
      .finally(() => setLoading(false));
  }, []);

  const filtradas = notifs.filter((n) => {
    if (filtro === "no-leidas") return !n.read;
    if (filtro !== "todas") return (n.type ?? "sistema") === filtro;
    return true;
  });

  const porGrupo = {
    hoy: filtradas.filter((n) => grupoFecha(n.createdAt) === "hoy"),
    ayer: filtradas.filter((n) => grupoFecha(n.createdAt) === "ayer"),
    semana: filtradas.filter((n) => grupoFecha(n.createdAt) === "semana"),
    antes: filtradas.filter((n) => grupoFecha(n.createdAt) === "antes"),
  };

  const marcarTodasLeidas = async () => {
    const noLeidas = notifs.filter((n) => !n.read);
    if (noLeidas.length === 0) return;
    setMarcandoTodas(true);
    try {
      await Promise.all(
        noLeidas.map((n) =>
          fetch("/api/notifications/mark-read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ notificationId: n.id }),
          })
        )
      );
      setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    } finally {
      setMarcandoTodas(false);
    }
  };

  const noLeidasCount = notifs.filter((n) => !n.read).length;

  return (
    <div
      style={{
        flex: 1,
        padding: "24px 32px",
        background: "#e8eaf0",
        minHeight: "100vh",
        fontFamily: "'Raleway', sans-serif",
        maxWidth: 1100,
        margin: "0 auto",
        width: "100%",
      }}
    >
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", marginBottom: 4 }}>
        Notificaciones
      </h1>
      <p style={{ fontSize: 13, color: "#8892b0", marginBottom: 24 }}>
        Todas tus actualizaciones en un solo lugar
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }} role="tablist">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filtro === f.id}
            onClick={() => setFiltro(f.id)}
            style={{
              padding: "8px 14px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              fontFamily: "'Raleway', sans-serif",
              fontSize: 12,
              fontWeight: 600,
              background: "#e8eaf0",
              color: filtro === f.id ? "#0a0f8a" : "#8892b0",
              boxShadow: filtro === f.id ? "inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff" : "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {noLeidasCount > 0 && (
        <button
          type="button"
          onClick={marcarTodasLeidas}
          disabled={marcandoTodas}
          style={{
            marginBottom: 24,
            padding: "8px 16px",
            borderRadius: 10,
            border: "none",
            cursor: marcandoTodas ? "wait" : "pointer",
            fontFamily: "'Raleway', sans-serif",
            fontSize: 12,
            fontWeight: 600,
            background: "#e8eaf0",
            color: "#1428d4",
            boxShadow: "3px 3px 8px #c2c8d6, -3px -3px 8px #ffffff",
          }}
        >
          {marcandoTodas ? "Marcando…" : "Marcar todas como leídas"}
        </button>
      )}

      {loading ? (
        <p style={{ fontSize: 13, color: "#8892b0" }}>Cargando…</p>
      ) : filtradas.length === 0 ? (
        <div
          style={{
            background: "#e8eaf0",
            borderRadius: 20,
            padding: 48,
            textAlign: "center",
            boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
          }}
        >
          <p style={{ fontSize: 14, color: "#8892b0" }}>No hay notificaciones con este filtro.</p>
        </div>
      ) : (
        <>
          {(["hoy", "ayer", "semana", "antes"] as const).map((grupo) => {
            const items = porGrupo[grupo];
            if (items.length === 0) return null;
            const titulos: Record<string, string> = { hoy: "Hoy", ayer: "Ayer", semana: "Esta semana", antes: "Anteriores" };
            return (
              <div key={grupo} style={{ marginBottom: 28 }}>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#8892b0",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    fontFamily: "'Space Mono', monospace",
                    marginBottom: 12,
                  }}
                >
                  {titulos[grupo]}
                </p>
                {items.map((n) => {
                  const tipo = TIPOS[n.type ?? "sistema"] ?? TIPOS.sistema;
                  return (
                    <div
                      key={n.id}
                      onClick={() => n.href && router.push(n.href)}
                      role={n.href ? "button" : undefined}
                      style={{
                        background: "#e8eaf0",
                        borderRadius: 14,
                        padding: "14px 18px",
                        marginBottom: 8,
                        cursor: n.href ? "pointer" : "default",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 14,
                        boxShadow: "5px 5px 12px #c2c8d6, -5px -5px 12px #ffffff",
                        borderLeft: `3px solid ${tipo.color}`,
                        opacity: n.read ? 0.85 : 1,
                      }}
                    >
                      <span
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          flexShrink: 0,
                          background: "#e8eaf0",
                          boxShadow: "inset 2px 2px 5px #c2c8d6, inset -2px -2px 5px #ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        aria-hidden
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={tipo.color} strokeWidth="2" strokeLinecap="round">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                          <path d="M13 22a2 2 0 0 1-2-2H9a2 2 0 0 1-2-2" />
                        </svg>
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "#0a0f8a" }}>{n.title}</p>
                        <p style={{ fontSize: 12, color: "#4a5580", marginTop: 2, fontFamily: "'Source Sans 3', sans-serif" }}>{n.description}</p>
                        <p style={{ fontSize: 10, color: "#8892b0", marginTop: 6, fontFamily: "'Space Mono', monospace" }}>{formatTiempo(n.createdAt)}</p>
                      </div>
                      {n.href && (
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#1428d4", flexShrink: 0 }}>Ir →</span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

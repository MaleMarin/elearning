"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const ESTADO_COLORES: Record<string, { bg: string; text: string; label: string }> = {
  pendiente: { bg: "rgba(20,40,212,0.08)", text: "#1428d4", label: "Pendiente" },
  vence_hoy: { bg: "rgba(216,64,64,0.12)", text: "#d84040", label: "Vence hoy" },
  vencida: { bg: "rgba(216,64,64,0.12)", text: "#d84040", label: "Vencida" },
  entregada: { bg: "rgba(0,184,125,0.1)", text: "#00b87d", label: "Entregada" },
  revisada: { bg: "rgba(0,229,160,0.1)", text: "#00b87d", label: "Revisada ✓" },
};

interface Task {
  id: string;
  title: string;
  due_at: string;
  completed_at: string | null;
  cohort_id: string | null;
  instructions?: string | null;
  feedback?: string | null;
  grade?: number | null;
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

function estadoTarea(t: Task): keyof typeof ESTADO_COLORES {
  if (t.completed_at) {
    return t.feedback || t.grade != null ? "revisada" : "entregada";
  }
  const now = Date.now();
  const due = new Date(t.due_at).getTime();
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  if (due < now) return "vencida";
  if (due <= todayEnd.getTime()) return "vence_hoy";
  return "pendiente";
}

export default function TareasPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pendientes" | "entregadas" | "feedback">("pendientes");

  useEffect(() => {
    fetch("/api/tasks", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setTasks(d.tasks ?? []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  const tareasPendientes = tasks.filter((t) => !t.completed_at);
  const tareasEntregadas = tasks.filter((t) => t.completed_at && !t.feedback && t.grade == null);
  const tareasConFeedback = tasks.filter((t) => t.completed_at && (t.feedback || t.grade != null));

  const handleCompletar = async (taskId: string) => {
    const res = await fetch(`/api/tasks/${taskId}/complete`, { method: "POST", credentials: "include" });
    if (res.ok) {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, completed_at: new Date().toISOString() } : t)));
    }
  };

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
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", marginBottom: 4 }}>Tareas</h1>
        <p style={{ fontSize: 13, color: "#8892b0", marginBottom: 24 }}>Cargando…</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div style={baseLayout}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", marginBottom: 4 }}>Tareas</h1>
        <p style={{ fontSize: 13, color: "#8892b0", marginBottom: 24 }}>Actividades asignadas por tu facilitador</p>
        <div
          style={{
            background: "#e8eaf0",
            borderRadius: 20,
            padding: 40,
            textAlign: "center",
            maxWidth: 480,
            margin: "0 auto",
            boxShadow: "8px 8px 20px #c2c8d6, -8px -8px 20px #ffffff",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }} aria-hidden>✅</div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0a0f8a", marginBottom: 8 }}>Aún no tienes tareas asignadas</h2>
          <p style={{ fontSize: 13, color: "#8892b0", lineHeight: 1.6, marginBottom: 24 }}>
            Cuando te asignen tareas con fecha límite, aparecerán aquí.
          </p>
          <Link
            href="/curso"
            style={{
              display: "inline-block",
              padding: "12px 28px",
              borderRadius: 14,
              background: "linear-gradient(135deg, #1428d4, #0a0f8a)",
              color: "white",
              fontFamily: "'Raleway', sans-serif",
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "5px 5px 12px rgba(10,15,138,0.35)",
            }}
          >
            Ver curso
          </Link>
        </div>
      </div>
    );
  }

  const tabStyle = (active: boolean) => ({
    padding: "10px 18px",
    borderRadius: 12,
    border: "none" as const,
    cursor: "pointer" as const,
    fontFamily: "'Raleway', sans-serif",
    fontSize: 13,
    fontWeight: 600,
    background: "#e8eaf0",
    color: active ? "#0a0f8a" : "#8892b0",
    boxShadow: active ? "inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff" : "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff",
  });

  return (
    <div style={baseLayout}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", marginBottom: 4 }}>Tareas</h1>
      <p style={{ fontSize: 13, color: "#8892b0", marginBottom: 24 }}>
        Actividades asignadas por tu facilitador
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }} role="tablist">
        <button type="button" role="tab" aria-selected={tab === "pendientes"} onClick={() => setTab("pendientes")} style={tabStyle(tab === "pendientes")}>
          Pendientes ({tareasPendientes.length})
        </button>
        <button type="button" role="tab" aria-selected={tab === "entregadas"} onClick={() => setTab("entregadas")} style={tabStyle(tab === "entregadas")}>
          Entregadas ({tareasEntregadas.length})
        </button>
        <button type="button" role="tab" aria-selected={tab === "feedback"} onClick={() => setTab("feedback")} style={tabStyle(tab === "feedback")}>
          Con feedback ({tareasConFeedback.length})
        </button>
      </div>

      {tab === "pendientes" &&
        tareasPendientes.map((t) => {
          const est = estadoTarea(t);
          const col = ESTADO_COLORES[est];
          return (
            <div
              key={t.id}
              style={{
                background: "#e8eaf0",
                borderRadius: 18,
                padding: 20,
                marginBottom: 14,
                boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0a0f8a" }}>{t.title}</h3>
                <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "'Space Mono', monospace", padding: "3px 10px", borderRadius: 20, background: col.bg, color: col.text }}>
                  {col.label}
                  {est === "pendiente" || est === "vence_hoy" ? ` · ${formatFecha(t.due_at)}` : ""}
                </span>
              </div>
              {t.instructions && (
                <p style={{ fontSize: 13, color: "#4a5580", lineHeight: 1.6, marginBottom: 16, fontFamily: "'Source Sans 3', sans-serif" }}>{t.instructions}</p>
              )}
              <button
                type="button"
                onClick={() => handleCompletar(t.id)}
                style={{
                  padding: "10px 20px",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: 12,
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #1428d4, #0a0f8a)",
                  color: "white",
                  boxShadow: "4px 4px 10px rgba(10,15,138,0.3)",
                }}
              >
                Marcar como completada
              </button>
            </div>
          );
        })}

      {tab === "entregadas" &&
        tareasEntregadas.map((t) => {
          const col = ESTADO_COLORES.entregada;
          return (
            <div
              key={t.id}
              style={{
                background: "#e8eaf0",
                borderRadius: 18,
                padding: 20,
                marginBottom: 14,
                boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
                opacity: 0.95,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0a0f8a" }}>{t.title}</h3>
                <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "'Space Mono', monospace", padding: "3px 10px", borderRadius: 20, background: col.bg, color: col.text }}>
                  {col.label}
                </span>
              </div>
              {t.instructions && (
                <p style={{ fontSize: 13, color: "#4a5580", lineHeight: 1.6, marginTop: 8, fontFamily: "'Source Sans 3', sans-serif" }}>{t.instructions}</p>
              )}
            </div>
          );
        })}

      {tab === "feedback" &&
        (tareasConFeedback.length === 0 ? (
          <p style={{ fontSize: 13, color: "#8892b0" }}>Aún no tienes tareas con retroalimentación del facilitador.</p>
        ) : (
          tareasConFeedback.map((t) => {
            const col = ESTADO_COLORES.revisada;
            return (
              <div
                key={t.id}
                style={{
                  background: "#e8eaf0",
                  borderRadius: 18,
                  padding: 20,
                  marginBottom: 14,
                  boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0a0f8a" }}>{t.title}</h3>
                  <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "'Space Mono', monospace", padding: "3px 10px", borderRadius: 20, background: col.bg, color: col.text }}>
                    {col.label}
                    {t.grade != null ? ` · ${t.grade}` : ""}
                  </span>
                </div>
                {t.feedback && (
                  <div style={{ marginTop: 12, padding: 14, borderRadius: 12, background: "rgba(0,229,160,0.06)", borderLeft: "3px solid #00b87d" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#8892b0", marginBottom: 6, fontFamily: "'Space Mono', monospace" }}>Retroalimentación</p>
                    <p style={{ fontSize: 13, color: "#4a5580", lineHeight: 1.6, fontFamily: "'Source Sans 3', sans-serif" }}>{t.feedback}</p>
                  </div>
                )}
              </div>
            );
          })
        ))}
    </div>
  );
}

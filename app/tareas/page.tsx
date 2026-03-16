"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Task {
  id: string;
  title: string;
  due_at: string;
  completed_at: string | null;
  cohort_id: string | null;
  instructions?: string | null;
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

function estaVencida(dueAt: string) {
  return new Date(dueAt).getTime() < Date.now();
}

export default function TareasPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pendientes" | "completadas">("pendientes");

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((d) => setTasks(d.tasks ?? []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  const tareasPendientes = tasks.filter((t) => !t.completed_at);
  const tareasCompletadas = tasks.filter((t) => t.completed_at);

  const handleCompletar = async (taskId: string) => {
    const res = await fetch(`/api/tasks/${taskId}/complete`, { method: "POST", credentials: "include" });
    if (res.ok) {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, completed_at: new Date().toISOString() } : t)));
    }
  };

  if (loading) {
    return (
      <div style={{ flex: 1, padding: "20px", background: "#e8eaf0", minHeight: "100vh", fontFamily: "var(--font-heading)" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", marginBottom: 4 }}>Mis tareas</h1>
        <p style={{ fontSize: 13, color: "#8892b0", marginBottom: 24 }}>Cargando…</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div style={{ flex: 1, padding: "20px", background: "#e8eaf0", minHeight: "100vh", fontFamily: "var(--font-heading)" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", marginBottom: 4 }}>Mis tareas</h1>
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
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
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
              fontFamily: "var(--font-heading)",
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

  return (
    <div style={{ flex: 1, padding: "20px", background: "#e8eaf0", minHeight: "100vh", fontFamily: "var(--font-heading)" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", marginBottom: 4 }}>Mis tareas</h1>
      <p style={{ fontSize: 13, color: "#8892b0", marginBottom: 24 }}>Actividades asignadas por tu facilitador</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "pendientes"}
          onClick={() => setTab("pendientes")}
          style={{
            padding: "10px 18px",
            borderRadius: 12,
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-heading)",
            fontSize: 13,
            fontWeight: 600,
            background: tab === "pendientes" ? "#e8eaf0" : "#e8eaf0",
            color: tab === "pendientes" ? "#0a0f8a" : "#8892b0",
            boxShadow: tab === "pendientes" ? "inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff" : "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff",
          }}
        >
          Pendientes ({tareasPendientes.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "completadas"}
          onClick={() => setTab("completadas")}
          style={{
            padding: "10px 18px",
            borderRadius: 12,
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-heading)",
            fontSize: 13,
            fontWeight: 600,
            background: "#e8eaf0",
            color: tab === "completadas" ? "#0a0f8a" : "#8892b0",
            boxShadow: tab === "completadas" ? "inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff" : "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff",
          }}
        >
          Completadas ({tareasCompletadas.length})
        </button>
      </div>

      {tab === "pendientes" &&
        tareasPendientes.map((t) => (
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
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: "'Space Mono', monospace",
                  padding: "3px 10px",
                  borderRadius: 20,
                  background: estaVencida(t.due_at) ? "rgba(216,64,64,0.12)" : "rgba(20,40,212,0.08)",
                  color: estaVencida(t.due_at) ? "#d84040" : "#1428d4",
                }}
              >
                Vence {formatFecha(t.due_at)}
              </span>
            </div>
            {t.instructions && (
              <p style={{ fontSize: 13, color: "#4a5580", lineHeight: 1.6, marginBottom: 16 }}>{t.instructions}</p>
            )}
            <button
              type="button"
              onClick={() => handleCompletar(t.id)}
              style={{
                padding: "10px 20px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-heading)",
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
        ))}

      {tab === "completadas" &&
        tareasCompletadas.map((t) => (
          <div
            key={t.id}
            style={{
              background: "#e8eaf0",
              borderRadius: 18,
              padding: 20,
              marginBottom: 14,
              boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
              opacity: 0.9,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0a0f8a" }}>{t.title}</h3>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: "'Space Mono', monospace",
                  padding: "3px 10px",
                  borderRadius: 20,
                  background: "rgba(0,184,125,0.15)",
                  color: "#00b87d",
                }}
              >
                Completada
              </span>
            </div>
            {t.instructions && (
              <p style={{ fontSize: 13, color: "#4a5580", lineHeight: 1.6, marginTop: 8 }}>{t.instructions}</p>
            )}
          </div>
        ))}
    </div>
  );
}

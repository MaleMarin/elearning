"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MetricCard } from "@/components/admin/MetricCard";
import { PrimaryButton } from "@/components/ui";
import { getDemoMode } from "@/lib/env";
import { Send, Database, Loader2 } from "lucide-react";

interface DashboardStats {
  alumnosActivos: number;
  tasaCompletacion: string;
  nps: number;
  certificadosEmitidos: number;
  trendAlumnos: string;
  trendTasa: string;
  trendNps: string;
  trendCertificados: string;
}

interface AlumnoRiesgo {
  id: string;
  nombre: string;
  institucion: string;
  progreso: number;
  ultimoAcceso: string;
}

interface ActividadItem {
  id: string;
  tipo: string;
  texto: string;
  timestamp: string;
}

function demoStats(): DashboardStats {
  return {
    alumnosActivos: 124,
    tasaCompletacion: "34%",
    nps: 8.4,
    certificadosEmitidos: 38,
    trendAlumnos: "+12 esta semana",
    trendTasa: "+5% vs semana pasada",
    trendNps: "↑ 0.3",
    trendCertificados: "6 esta semana",
  };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [riesgo, setRiesgo] = useState<AlumnoRiesgo[]>([]);
  const [actividad, setActividad] = useState<ActividadItem[]>([]);
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedMessage, setSeedMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (getDemoMode()) {
      setStats(demoStats());
      setRiesgo([
        { id: "1", nombre: "María García", institucion: "SHCP", progreso: 18, ultimoAcceso: "hace 6 días" },
        { id: "2", nombre: "Juan Pérez", institucion: "SFP", progreso: 25, ultimoAcceso: "hace 5 días" },
      ]);
      setActividad([
        { id: "1", tipo: "leccion", texto: "Ana López completó la lección «Innovación en servicios»", timestamp: "hace 5 min" },
        { id: "2", tipo: "badge", texto: "Carlos Ruiz obtuvo el badge «Primera lección»", timestamp: "hace 12 min" },
        { id: "3", tipo: "certificado", texto: "Certificado emitido a Laura Martínez", timestamp: "hace 1 h" },
      ]);
      return;
    }
    fetch("/api/admin/dashboard/stats", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setStats(data);
        else setStats(demoStats());
      })
      .catch(() => setStats(demoStats()));
    fetch("/api/admin/dashboard/at-risk", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setRiesgo(Array.isArray(data?.alumnos) ? data.alumnos : []))
      .catch(() => setRiesgo([]));
    fetch("/api/admin/dashboard/activity", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setActividad(Array.isArray(data?.items) ? data.items : []))
      .catch(() => setActividad([]));
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8" style={{ fontFamily: "var(--font)" }}>
      <div>
        <h1 className="text-2xl font-semibold text-[var(--ink)]">Dashboard</h1>
        <p className="text-sm text-[var(--texto-sub)] mt-1">Resumen del programa y alumnos en riesgo.</p>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Alumnos activos"
          value={stats?.alumnosActivos ?? "—"}
          trend={stats?.trendAlumnos}
        />
        <MetricCard
          label="Tasa de completación"
          value={stats?.tasaCompletacion ?? "—"}
          trend={stats?.trendTasa}
        />
        <MetricCard
          label="NPS del programa"
          value={stats?.nps ?? "—"}
          trend={stats?.trendNps}
        />
        <MetricCard
          label="Certificados emitidos"
          value={stats?.certificadosEmitidos ?? "—"}
          trend={stats?.trendCertificados}
        />
      </div>

      {/* Alumnos en riesgo */}
      <section
        className="rounded-[16px] p-4 sm:p-6"
        style={{
          background: "var(--neu-bg)",
          boxShadow: "var(--neu-shadow-out-sm)",
        }}
      >
        <h2 className="text-lg font-semibold text-[var(--ink)] mb-4">Alumnos en riesgo</h2>
        <p className="text-sm text-[var(--texto-sub)] mb-4">
          Sin actividad &gt; 5 días y progreso &lt; 30%.
        </p>
        {riesgo.length === 0 ? (
          <p className="text-sm text-[var(--texto-sub)]">Ningún alumno en riesgo según los criterios actuales.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="text-left text-[var(--texto-sub)] border-b border-[var(--line)]">
                  <th className="pb-2 pr-4 font-medium">Nombre</th>
                  <th className="pb-2 pr-4 font-medium">Institución</th>
                  <th className="pb-2 pr-4 font-medium">Progreso</th>
                  <th className="pb-2 pr-4 font-medium">Último acceso</th>
                  <th className="pb-2 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody>
                {riesgo.map((a) => (
                  <tr key={a.id} className="border-b border-[var(--line-subtle)]">
                    <td className="py-3 pr-4 text-[var(--ink)]">{a.nombre}</td>
                    <td className="py-3 pr-4 text-[var(--texto-sub)]">{a.institucion}</td>
                    <td className="py-3 pr-4 text-[var(--ink)]">{a.progreso}%</td>
                    <td className="py-3 pr-4 text-[var(--texto-sub)]">{a.ultimoAcceso}</td>
                    <td className="py-3">
                      <PrimaryButton
                        href={`/admin/alumnos/${a.id}`}
                        className="!inline-flex items-center gap-1.5 !py-1.5 !px-3 !text-xs"
                      >
                        <Send className="w-3.5 h-3.5" aria-hidden />
                        Enviar recordatorio
                      </PrimaryButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Actividad reciente */}
      <section
        className="rounded-[16px] p-4 sm:p-6"
        style={{
          background: "var(--neu-bg)",
          boxShadow: "var(--neu-shadow-out-sm)",
        }}
      >
        <h2 className="text-lg font-semibold text-[var(--ink)] mb-4">Actividad reciente</h2>
        {actividad.length === 0 ? (
          <p className="text-sm text-[var(--texto-sub)]">No hay actividad reciente.</p>
        ) : (
          <ul className="space-y-3">
            {actividad.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-3 py-2 border-b border-[var(--line-subtle)] last:border-0"
              >
                <span className="text-[var(--texto-sub)] text-xs shrink-0">{item.timestamp}</span>
                <span className="text-sm text-[var(--ink)]">{item.texto}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Configuración */}
      <section
        className="rounded-[16px] p-4 sm:p-6"
        style={{
          background: "var(--neu-bg)",
          boxShadow: "var(--neu-shadow-out-sm)",
        }}
      >
        <h2 className="text-lg font-semibold text-[var(--ink)] mb-4">Configuración</h2>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={async () => {
              setSeedMessage(null);
              setSeedLoading(true);
              try {
                const res = await fetch("/api/admin/seed/simulations", {
                  method: "POST",
                  credentials: "include",
                });
                const data = await res.json().catch(() => ({}));
                if (res.ok) {
                  setSeedMessage({
                    type: "success",
                    text: data.message ?? "3 escenarios del simulador cargados en Firestore.",
                  });
                } else {
                  setSeedMessage({
                    type: "error",
                    text: data.error ?? "Error al cargar escenarios",
                  });
                }
              } catch {
                setSeedMessage({ type: "error", text: "Error de conexión" });
              } finally {
                setSeedLoading(false);
              }
            }}
            disabled={seedLoading}
            className="inline-flex items-center gap-2 rounded-xl font-semibold px-4 py-2.5 text-sm bg-[var(--primary)] text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {seedLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
            ) : (
              <Database className="w-4 h-4" aria-hidden />
            )}
            Cargar escenarios del simulador
          </button>
          {seedMessage && (
            <span
              className={`text-sm ${seedMessage.type === "success" ? "text-[var(--success)]" : "text-[var(--error)]"}`}
              role="status"
            >
              {seedMessage.text}
            </span>
          )}
        </div>
      </section>

      {/* Acceso rápido */}
      <section
        className="rounded-[16px] p-4 sm:p-6"
        style={{
          background: "var(--neu-bg)",
          boxShadow: "var(--neu-shadow-out-sm)",
        }}
      >
        <h2 className="text-lg font-semibold text-[var(--ink)] mb-4">Acceso rápido</h2>
        <div className="flex flex-wrap gap-3">
          <PrimaryButton href="/admin/cursos" className="!inline-flex items-center gap-2">
            Cursos
          </PrimaryButton>
          <PrimaryButton href="/admin/cohortes" className="!inline-flex items-center gap-2">
            Cohortes
          </PrimaryButton>
          <PrimaryButton href="/admin/alumnos/importar" className="!inline-flex items-center gap-2">
            Importar alumnos
          </PrimaryButton>
          <PrimaryButton href="/admin/certificados" className="!inline-flex items-center gap-2">
            Certificados
          </PrimaryButton>
          <PrimaryButton href="/admin/notificaciones" className="!inline-flex items-center gap-2">
            Notificaciones
          </PrimaryButton>
          <PrimaryButton href="/admin/analytics" className="!inline-flex items-center gap-2">
            Analytics
          </PrimaryButton>
        </div>
      </section>
    </div>
  );
}

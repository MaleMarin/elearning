"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

const PLANTILLAS = [
  { id: "recordatorio_sesion", label: "Recordatorio de sesión", mensaje: "Recuerda que tienes una sesión en vivo hoy. ¡No te la pierdas!" },
  { id: "recordatorio_tarea", label: "Recordatorio de tarea", mensaje: "Tienes una tarea pendiente. La fecha límite se acerca." },
  { id: "certificado_listo", label: "Certificado disponible", mensaje: "¡Felicidades! Tu certificado está listo para descargar." },
  { id: "inactividad", label: "Recordatorio de inactividad", mensaje: "Te extrañamos. ¡Retoma tu curso donde lo dejaste!" },
  { id: "racha", label: "Mantén tu racha", mensaje: "¡Tienes una racha activa! Estudia hoy para mantenerla." },
  { id: "bienvenida", label: "Bienvenida al programa", mensaje: "Bienvenido/a a Política Digital. Tu formación comienza hoy." },
  { id: "recordatorio_modulo", label: "Nuevo módulo disponible", mensaje: "Tienes un nuevo módulo disponible. ¡Empiézalo hoy!" },
  { id: "recordatorio_quiz", label: "Quiz pendiente", mensaje: "Tienes un quiz pendiente. ¡Complétalo para avanzar!" },
];

const TEMPLATE_OPTIONS = PLANTILLAS.map((p) => ({ value: p.id, label: p.label }));

const CHANNEL_OPTIONS = [
  { value: "push", label: "Push (navegador)" },
  { value: "whatsapp", label: "WhatsApp (ver Centro de Comunicación)" },
  { value: "all", label: "Push + aviso WhatsApp" },
];

type LogRow = {
  id: string;
  channel: string;
  to: string;
  template_name: string | null;
  status: string;
  recipient_user_id: string | null;
  created_at: string;
};

type Stats = { pushActive: number; totalUsers: number; whatsappSentMonth: number };

export default function AdminNotificacionesPage() {
  const [cohorts, setCohorts] = useState<{ id: string; name: string }[]>([]);
  const [scope, setScope] = useState<"cohort" | "user">("cohort");
  const [cohortId, setCohortId] = useState("");
  const [userId, setUserId] = useState("");
  const [channel, setChannel] = useState("push");
  const [templateKey, setTemplateKey] = useState("recordatorio_sesion");
  const [mensaje, setMensaje] = useState(PLANTILLAS[0]?.mensaje ?? "");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [logsChannel, setLogsChannel] = useState("");
  const [logsCohortId, setLogsCohortId] = useState("");

  useEffect(() => {
    fetch("/api/admin/cohorts", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d) ? d : (d as { cohorts?: { id: string; name: string }[] })?.cohorts ?? [];
        const arr = Array.isArray(d) ? d : list;
        setCohorts(arr.map((c: { id: string; name?: string; nombre?: string }) => ({ id: c.id, name: c.name ?? c.nombre ?? c.id })));
        if (arr[0]) setCohortId(arr[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (logsCohortId) params.set("cohortId", logsCohortId);
    if (logsChannel) params.set("channel", logsChannel);
    fetch(`/api/admin/notifications/logs?${params}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setLogs((d.logs ?? []) as LogRow[]))
      .catch(() => setLogs([]));
  }, [logsCohortId, logsChannel]);

  useEffect(() => {
    fetch("/api/admin/notifications/stats", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) setStats(d as Stats);
      })
      .catch(() => {});
  }, []);

  const handleSend = () => {
    setSending(true);
    setSendResult(null);
    fetch("/api/admin/notifications/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        scope,
        cohortId: scope === "cohort" ? cohortId : undefined,
        userId: scope === "user" ? userId || undefined : undefined,
        channel,
        templateKey: templateKey || "recordatorio_sesion",
        mensaje: mensaje.trim() || undefined,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setSendResult(`Error: ${d.error}`);
        else setSendResult(`Enviado: ${(d.results ?? []).filter((r: { ok: boolean }) => r.ok).length} ok, ${(d.results ?? []).filter((r: { ok: boolean }) => !r.ok).length} fallidos.`);
        if (d.results?.length) {
          setLogsCohortId("");
          setLogsChannel("");
          return fetch("/api/admin/notifications/logs").then((r) => r.json()).then((x) => setLogs(x.logs ?? []));
        }
      })
      .catch((e) => setSendResult(`Error: ${e.message}`))
      .finally(() => setSending(false));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link href="/admin" className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--ink)] mb-6">
        <ChevronLeft className="w-5 h-5" /> Admin
      </Link>
      <h1 className="text-2xl font-bold text-[var(--ink)] mb-2">Notificaciones</h1>
      <p className="text-[var(--text-muted)] mb-6">
        Envía notificaciones manuales por Push. Para WhatsApp usa el{" "}
        <Link href="/panel/comunicacion" className="text-[var(--primary)] underline">Centro de Comunicación</Link>.
      </p>

      {/* Sección 1 — Enviar */}
      <section className="card-premium p-6 mb-6">
        <h2 className="text-lg font-semibold text-[var(--ink)] mb-4">Enviar notificación manual</h2>
        <div className="space-y-4">
          <label className="block">
            <span className="font-medium text-[var(--text)]">Destinatarios</span>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as "cohort" | "user")}
              className="mt-1 block w-full max-w-xs px-4 py-3 rounded-lg border border-[var(--line)] bg-[var(--surface)] min-h-[48px]"
            >
              <option value="cohort">A un grupo</option>
              <option value="user">A un alumno (por ID)</option>
            </select>
          </label>
          {scope === "cohort" && (
            <label className="block">
              <span className="font-medium text-[var(--text)]">Grupo</span>
              <select
                value={cohortId}
                onChange={(e) => setCohortId(e.target.value)}
                className="mt-1 block w-full max-w-xs px-4 py-3 rounded-lg border border-[var(--line)] bg-[var(--surface)] min-h-[48px]"
              >
                <option value="">Seleccionar</option>
                {cohorts.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
          )}
          {scope === "user" && (
            <label className="block">
              <span className="font-medium text-[var(--text)]">User ID (Firebase UID)</span>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="ej. abc123..."
                className="mt-1 block w-full max-w-md px-4 py-3 rounded-lg border border-[var(--line)] bg-[var(--surface)] min-h-[48px]"
              />
            </label>
          )}
          <label className="block">
            <span className="font-medium text-[var(--text)]">Plantilla</span>
            <select
              value={templateKey}
              onChange={(e) => {
                const id = e.target.value;
                setTemplateKey(id);
                setMensaje(PLANTILLAS.find((p) => p.id === id)?.mensaje ?? "");
              }}
              className="mt-1 block w-full max-w-xs px-4 py-3 rounded-lg border border-[var(--line)] bg-[var(--surface)] min-h-[48px]"
            >
              <option value="">Seleccionar plantilla…</option>
              {PLANTILLAS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="font-medium text-[var(--text)]">Mensaje (se rellena con la plantilla)</span>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              rows={3}
              className="mt-1 block w-full max-w-md px-4 py-3 rounded-lg border border-[var(--line)] bg-[var(--surface)] min-h-[80px]"
              placeholder="Texto del mensaje"
            />
          </label>
          <label className="block">
            <span className="font-medium text-[var(--text)]">Canal</span>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="mt-1 block w-full max-w-xs px-4 py-3 rounded-lg border border-[var(--line)] bg-[var(--surface)] min-h-[48px]"
            >
              {CHANNEL_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </label>
          <p className="text-sm text-[var(--text-muted)]">
            Vista previa: <strong>{PLANTILLAS.find((p) => p.id === templateKey)?.label ?? templateKey}</strong>
          </p>
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || (scope === "cohort" && !cohortId) || (scope === "user" && !userId.trim())}
            className="btn-primary disabled:opacity-50"
          >
            {sending ? "Enviando…" : "Enviar ahora"}
          </button>
          {sendResult && <p className="text-sm text-[var(--ink)]" role="alert">{sendResult}</p>}
        </div>
      </section>

      {/* Sección 2 — Historial */}
      <section className="card-premium p-6 mb-6">
        <h2 className="text-lg font-semibold text-[var(--ink)] mb-4">Historial</h2>
        <div className="flex flex-wrap gap-4 mb-4">
          <select
            value={logsCohortId}
            onChange={(e) => setLogsCohortId(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--surface)]"
          >
            <option value="">Todos los grupos</option>
            {cohorts.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={logsChannel}
            onChange={(e) => setLogsChannel(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--surface)]"
          >
            <option value="">Todos los canales</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="push">Push</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--line)]">
                <th className="text-left py-2">Fecha</th>
                <th className="text-left py-2">Canal</th>
                <th className="text-left py-2">Destinatario</th>
                <th className="text-left py-2">Plantilla</th>
                <th className="text-left py-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && (
                <tr><td colSpan={5} className="py-4 text-[var(--text-muted)]">Sin registros o Supabase no configurado.</td></tr>
              )}
              {logs.map((row) => (
                <tr key={row.id} className="border-b border-[var(--line)]">
                  <td className="py-2">{row.created_at ? new Date(row.created_at).toLocaleString() : "—"}</td>
                  <td className="py-2">{row.channel}</td>
                  <td className="py-2">{row.to || row.recipient_user_id || "—"}</td>
                  <td className="py-2">{row.template_name ?? "—"}</td>
                  <td className="py-2">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Sección 3 — Estadísticas */}
      <section className="card-premium p-6">
        <h2 className="text-lg font-semibold text-[var(--ink)] mb-4">Estadísticas</h2>
        {stats ? (
          <ul className="space-y-2 text-[var(--text)]">
            <li>Push activos (suscripciones): <strong>{stats.pushActive}</strong></li>
            <li>Total usuarios (perfiles): <strong>{stats.totalUsers}</strong></li>
            <li>WhatsApp enviados este mes: <strong>{stats.whatsappSentMonth}</strong></li>
          </ul>
        ) : (
          <p className="text-[var(--text-muted)]">Cargando…</p>
        )}
      </section>
    </div>
  );
}

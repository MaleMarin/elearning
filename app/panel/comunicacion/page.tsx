"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { MessageLogRow } from "@/lib/types/whatsapp";

export default function CentroComunicacionPage() {
  const [cohorts, setCohorts] = useState<{ id: string; name: string }[]>([]);
  const [selectedCohort, setSelectedCohort] = useState("");
  const [logs, setLogs] = useState<MessageLogRow[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [language, setLanguage] = useState("es");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/cohorts")
      .then((r) => r.json())
      .then((d) => setCohorts(d.cohorts ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const url = selectedCohort ? `/api/whatsapp/logs?cohortId=${selectedCohort}` : "/api/whatsapp/logs";
    fetch(url)
      .then((r) => r.json())
      .then((d) => setLogs(d.logs ?? []))
      .catch(() => setLogs([]));
  }, [selectedCohort]);

  const sendReminder = () => {
    if (!selectedCohort || !templateName.trim() || sending) return;
    setSending(true);
    setError(null);
    fetch("/api/whatsapp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cohortId: selectedCohort, templateName: templateName.trim(), language }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else if (d.results?.length) {
          setError(null);
          const url = selectedCohort ? `/api/whatsapp/logs?cohortId=${selectedCohort}` : "/api/whatsapp/logs";
          return fetch(url).then((r) => r.json()).then((x) => setLogs(x.logs ?? []));
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setSending(false));
  };

  return (
    <div className="max-w-4xl">
      <nav className="text-sm text-[var(--text-muted)] mb-4">
        <Link href="/panel/contenido" className="hover:text-[var(--accent)]">Panel</Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--text)]">Centro de Comunicación</span>
      </nav>
      <h1 className="text-2xl font-bold text-[var(--text)] mb-4">Centro de Comunicación</h1>
      <p className="text-[var(--text-muted)] mb-6">
        Envía recordatorios por WhatsApp a una cohorte usando plantillas aprobadas. Revisa el estado de entrega abajo.
      </p>

      <div className="card-white p-6 mb-6">
        <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Enviar recordatorio a cohorte</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <label className="min-w-[200px]">
            <span className="block font-medium text-[var(--text)] mb-1">Cohorte</span>
            <select
              value={selectedCohort}
              onChange={(e) => setSelectedCohort(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 min-h-[48px]"
            >
              <option value="">Seleccionar cohorte</option>
              {cohorts.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="block font-medium text-[var(--text)] mb-1">Plantilla</span>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="nombre_plantilla"
              className="px-4 py-3 rounded-lg border border-gray-300 min-h-[48px] w-48"
            />
          </label>
          <label>
            <span className="block font-medium text-[var(--text)] mb-1">Idioma</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 min-h-[48px]"
            >
              <option value="es">es</option>
              <option value="en">en</option>
            </select>
          </label>
          <button
            type="button"
            onClick={sendReminder}
            disabled={sending || !selectedCohort || !templateName.trim()}
            className="btn-primary disabled:opacity-50"
          >
            {sending ? "Enviando…" : "Enviar a cohorte"}
          </button>
        </div>
        {error && <p className="text-[var(--error)] text-sm mt-3" role="alert">{error}</p>}
      </div>

      <div className="card-white p-6">
        <h2 className="text-lg font-semibold text-[var(--text)] mb-3">Estado de entrega</h2>
        <p className="text-[var(--text-muted)] text-sm mb-4">
          {selectedCohort ? "Logs de la cohorte seleccionada." : "Selecciona una cohorte para filtrar (admin ve todos)."}
        </p>
        {logs.length === 0 ? (
          <p className="text-[var(--text-muted)]">No hay envíos aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="py-2 pr-4">Fecha</th>
                  <th className="py-2 pr-4">Destino</th>
                  <th className="py-2 pr-4">Plantilla</th>
                  <th className="py-2 pr-4">Estado</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-100">
                    <td className="py-2 pr-4 text-[var(--text-muted)]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-2 pr-4">{log.to}</td>
                    <td className="py-2 pr-4">{log.template_name ?? "—"}</td>
                    <td className="py-2 pr-4">
                      <span className={`px-2 py-0.5 rounded text-sm ${
                        log.status === "delivered" ? "bg-green-100" :
                        log.status === "failed" ? "bg-red-100" :
                        log.status === "read" ? "bg-blue-100" : "bg-gray-100"
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

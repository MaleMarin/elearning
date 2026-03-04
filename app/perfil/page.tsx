"use client";

import { useState, useEffect } from "react";
import type { PreferredChannel } from "@/lib/types/whatsapp";

export default function PerfilPage() {
  const [phone, setPhone] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [preferredChannel, setPreferredChannel] = useState<PreferredChannel>("in_app");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user/channels")
      .then((r) => r.json())
      .then((d) => {
        if (d.channel) {
          setPhone(d.channel.whatsapp_number_e164 ?? "");
          setOptIn(!!d.channel.whatsapp_opt_in);
          setPreferredChannel(d.channel.preferred_channel ?? "in_app");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = () => {
    setSaving(true);
    setMessage(null);
    fetch("/api/user/channels", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        whatsapp_number_e164: phone.trim() || null,
        whatsapp_opt_in: optIn,
        preferred_channel: preferredChannel,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setMessage(d.error);
        else setMessage("Preferencias guardadas.");
      })
      .catch(() => setMessage("Error al guardar"))
      .finally(() => setSaving(false));
  };

  if (loading) return <p className="text-[var(--text-muted)]">Cargando…</p>;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-4">Mi perfil</h1>

      <div className="card-white p-6 mb-6">
        <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Comunicación y WhatsApp</h2>
        <p className="text-[var(--text-muted)] text-sm mb-4">
          Indica tu número en formato internacional (E.164), por ejemplo +34912345678 o +56912345678.
        </p>
        <label className="block mb-4">
          <span className="font-medium text-[var(--text)]">Teléfono (WhatsApp)</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+34 612 345 678"
            className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 text-[var(--text)] text-base min-h-[48px]"
          />
        </label>
        <label className="flex items-center gap-3 mb-4 min-h-[48px]">
          <input
            type="checkbox"
            checked={optIn}
            onChange={(e) => setOptIn(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300"
          />
          <span className="text-[var(--text)]">Acepto recibir recordatorios y avisos por WhatsApp</span>
        </label>
        <label className="block mb-4">
          <span className="font-medium text-[var(--text)]">Canal preferido para notificaciones</span>
          <select
            value={preferredChannel}
            onChange={(e) => setPreferredChannel(e.target.value as PreferredChannel)}
            className="mt-1 block w-full max-w-xs px-4 py-3 rounded-lg border border-gray-300 text-base min-h-[48px]"
          >
            <option value="in_app">En la plataforma</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Correo electrónico</option>
          </select>
        </label>
        {message && (
          <p className={`text-sm mb-4 ${message.startsWith("Error") ? "text-[var(--error)]" : "text-[var(--success)]"}`} role="alert">
            {message}
          </p>
        )}
        <button type="button" onClick={save} disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? "Guardando…" : "Guardar preferencias"}
        </button>
      </div>
    </div>
  );
}

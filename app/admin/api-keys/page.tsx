"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SurfaceCard, PrimaryButton, SecondaryButton } from "@/components/ui";
import { Alert } from "@/components/ui/Alert";
import { ChevronLeft, Key, Copy } from "lucide-react";

type KeyRow = {
  id: string;
  keyPrefix: string;
  institucion: string;
  permisos: string[];
  createdAt: string;
  lastUsedAt: string | null;
  revoked: boolean;
};

export default function AdminApiKeysPage() {
  const [keys, setKeys] = useState<KeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [institucion, setInstitucion] = useState("");
  const [permisos, setPermisos] = useState<string[]>(["progreso"]);
  const [creating, setCreating] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchKeys = () => {
    fetch("/api/admin/api-keys", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setKeys(data.keys ?? []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreating(true);
    setNewKeyValue(null);
    fetch("/api/admin/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ institucion: institucion.trim(), permisos }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setNewKeyValue(data.keyValue);
        setInstitucion("");
        setPermisos(["progreso"]);
        fetchKeys();
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error al crear"))
      .finally(() => setCreating(false));
  };

  const handleRevoke = (id: string) => {
    if (!confirm("¿Revocar esta API key? Las integraciones que la usen dejarán de funcionar.")) return;
    setError(null);
    fetch(`/api/admin/api-keys/${id}`, { method: "DELETE", credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, revoked: true } : k)));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error al revocar"));
  };

  const copyKey = (value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const togglePermiso = (p: string) => {
    setPermisos((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="inline-flex items-center gap-2 text-[var(--ink-muted)] hover:text-[var(--ink)] no-underline text-sm font-medium">
            <ChevronLeft className="w-4 h-4" /> Volver
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-[var(--ink)] mb-2">API Keys</h1>
        <p className="text-[var(--ink-muted)] mb-6">
          Genera API keys para integraciones institucionales. Usa el header <code className="text-sm bg-[var(--surface-soft)] px-1 rounded">X-API-Key</code> en las peticiones a <code className="text-sm bg-[var(--surface-soft)] px-1 rounded">/api/v1/</code>.
        </p>

        {error && <Alert message={error} variant="error" className="mb-4" />}

        <SurfaceCard padding="lg" clickable={false} className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-[var(--ink)] flex items-center gap-2">
              <Key className="w-5 h-5 text-[var(--primary)]" /> Crear API key
            </h2>
            {!createOpen ? (
              <PrimaryButton onClick={() => setCreateOpen(true)}>Generar key</PrimaryButton>
            ) : (
              <SecondaryButton onClick={() => { setCreateOpen(false); setNewKeyValue(null); }}>Cancelar</SecondaryButton>
            )}
          </div>
          {createOpen && (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-1">Institución *</label>
                <input
                  type="text"
                  value={institucion}
                  onChange={(e) => setInstitucion(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
                  placeholder="Ej. SHCP, IMSS"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-2">Permisos</label>
                <div className="flex flex-wrap gap-3">
                  {["progreso", "webhooks", "admin"].map((p) => (
                    <label key={p} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={permisos.includes(p)} onChange={() => togglePermiso(p)} className="rounded border-[var(--line)]" />
                      <span className="text-sm text-[var(--ink)]">{p}</span>
                    </label>
                  ))}
                </div>
              </div>
              {newKeyValue && (
                <div className="p-4 rounded-xl bg-[var(--amber-soft)] border border-[var(--amber)]">
                  <p className="text-sm font-medium text-[var(--ink)] mb-2">Guarda esta key; no se volverá a mostrar.</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="flex-1 min-w-0 break-all text-sm font-mono">{newKeyValue}</code>
                    <SecondaryButton type="button" onClick={() => copyKey(newKeyValue)} className="shrink-0">
                      <Copy className="w-4 h-4" /> {copied ? "Copiado" : "Copiar"}
                    </SecondaryButton>
                  </div>
                </div>
              )}
              <PrimaryButton type="submit" disabled={creating || !institucion.trim()}>
                {creating ? "Creando…" : "Crear API key"}
              </PrimaryButton>
            </form>
          )}
        </SurfaceCard>

        <h2 className="text-lg font-semibold text-[var(--ink)] mb-3">Keys existentes</h2>
        {loading ? (
          <p className="text-[var(--ink-muted)]">Cargando…</p>
        ) : keys.length === 0 ? (
          <SurfaceCard padding="lg" clickable={false}>
            <p className="text-[var(--ink-muted)] text-center py-6">Aún no hay API keys. Genera una arriba.</p>
          </SurfaceCard>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[var(--line-subtle)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--line-subtle)] bg-[var(--bg)]">
                  <th className="text-left py-3 px-4 font-semibold text-[var(--ink)]">Key</th>
                  <th className="text-left py-3 px-4 font-semibold text-[var(--ink)]">Institución</th>
                  <th className="text-left py-3 px-4 font-semibold text-[var(--ink)]">Permisos</th>
                  <th className="text-left py-3 px-4 font-semibold text-[var(--ink)]">Último uso</th>
                  <th className="text-right py-3 px-4 font-semibold text-[var(--ink)]">Acción</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id} className={`border-b border-[var(--line-subtle)] last:border-b-0 ${k.revoked ? "opacity-60" : ""}`}>
                    <td className="py-2 px-4 font-mono text-[var(--ink)]">{k.keyPrefix}</td>
                    <td className="py-2 px-4 text-[var(--ink)]">{k.institucion}</td>
                    <td className="py-2 px-4 text-[var(--ink-muted)]">{k.permisos.join(", ")}</td>
                    <td className="py-2 px-4 text-[var(--ink-muted)]">{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString("es") : "—"}</td>
                    <td className="py-2 px-4 text-right">
                      {!k.revoked && (
                        <button type="button" onClick={() => handleRevoke(k.id)} className="text-[var(--coral)] hover:underline text-sm">
                          Revocar
                        </button>
                      )}
                      {k.revoked && <span className="text-[var(--muted)] text-sm">Revocada</span>}
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

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SurfaceCard, PrimaryButton, SecondaryButton } from "@/components/ui";
import { Alert } from "@/components/ui/Alert";
import { ChevronLeft, Building2, Plus } from "lucide-react";

type Tenant = {
  tenantId: string;
  nombre: string;
  subdominio: string;
  plan: string;
  alumnos: number;
  creadoAt: string;
};

export default function SuperadminTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [subdominio, setSubdominio] = useState("");
  const [plan, setPlan] = useState<"basico" | "pro" | "enterprise">("basico");
  const [adminEmail, setAdminEmail] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchTenants = () => {
    fetch("/api/superadmin/tenants", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setTenants(data.tenants ?? []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const sub = subdominio.trim().toLowerCase().replace(/\s+/g, "");
    if (!sub) return;
    setError(null);
    setCreating(true);
    fetch("/api/superadmin/tenants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        nombre: nombre.trim() || sub,
        subdominio: sub,
        plan,
        adminEmail: adminEmail.trim() || undefined,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setCreateOpen(false);
        setNombre("");
        setSubdominio("");
        setAdminEmail("");
        fetchTenants();
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error"))
      .finally(() => setCreating(false));
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <Link href="/superadmin" className="inline-flex items-center gap-2 text-[var(--ink-muted)] hover:text-[var(--ink)] no-underline text-sm font-medium mb-2">
            <ChevronLeft className="w-4 h-4" /> Volver
          </Link>
          <h1 className="text-2xl font-bold text-[var(--ink)]">Tenants</h1>
          <p className="text-[var(--ink-muted)]">Instituciones por subdominio. Cada nuevo tenant funciona en https://subdominio.tudominio.gob.mx</p>
        </div>
        <PrimaryButton onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4" /> Crear tenant
        </PrimaryButton>
      </div>

      {error && <Alert message={error} variant="error" className="mb-4" />}

      {createOpen && (
        <SurfaceCard padding="lg" clickable={false} className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--ink)] mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[var(--primary)]" /> Nuevo tenant
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">Nombre de la institución *</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
                placeholder="Ej. SHCP"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">Subdominio *</label>
              <input
                type="text"
                value={subdominio}
                onChange={(e) => setSubdominio(e.target.value.replace(/\s/g, "").toLowerCase())}
                className="w-full px-4 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] font-mono"
                placeholder="shcp"
              />
              <p className="text-xs text-[var(--ink-muted)] mt-1">Solo letras/números. La URL será https://subdominio.tudominio.gob.mx</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">Plan</label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value as "basico" | "pro" | "enterprise")}
                className="w-full px-4 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
              >
                <option value="basico">Básico</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">Email del admin (opcional)</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
                placeholder="admin@institucion.gob.mx"
              />
            </div>
            <div className="flex gap-2">
              <PrimaryButton type="submit" disabled={creating || !subdominio.trim()}>
                {creating ? "Creando…" : "Crear tenant"}
              </PrimaryButton>
              <SecondaryButton type="button" onClick={() => setCreateOpen(false)}>
                Cancelar
              </SecondaryButton>
            </div>
          </form>
        </SurfaceCard>
      )}

      <h2 className="text-lg font-semibold text-[var(--ink)] mb-3">Instituciones activas</h2>
      {loading ? (
        <p className="text-[var(--ink-muted)]">Cargando…</p>
      ) : tenants.length === 0 ? (
        <SurfaceCard padding="lg" clickable={false}>
          <p className="text-[var(--ink-muted)] text-center py-8">Aún no hay tenants. Crea uno arriba.</p>
        </SurfaceCard>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--line-subtle)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--line-subtle)] bg-[var(--bg)]">
                <th className="text-left py-3 px-4 font-semibold text-[var(--ink)]">Nombre</th>
                <th className="text-left py-3 px-4 font-semibold text-[var(--ink)]">Subdominio</th>
                <th className="text-left py-3 px-4 font-semibold text-[var(--ink)]">Plan</th>
                <th className="text-left py-3 px-4 font-semibold text-[var(--ink)]">Alumnos</th>
                <th className="text-left py-3 px-4 font-semibold text-[var(--ink)]">Creado</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.tenantId} className="border-b border-[var(--line-subtle)] last:border-b-0">
                  <td className="py-2 px-4 font-medium text-[var(--ink)]">{t.nombre}</td>
                  <td className="py-2 px-4 font-mono text-[var(--ink)]">{t.subdominio}</td>
                  <td className="py-2 px-4 text-[var(--ink-muted)]">{t.plan}</td>
                  <td className="py-2 px-4 text-[var(--ink)]">{t.alumnos}</td>
                  <td className="py-2 px-4 text-[var(--ink-muted)]">
                    {t.creadoAt ? new Date(t.creadoAt).toLocaleDateString("es") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 text-sm text-[var(--ink-muted)]">
        En Vercel Pro configura el dominio wildcard <code className="bg-[var(--surface-soft)] px-1 rounded">*.politicadigital.gob.mx</code> para que cada subdominio resuelva a esta app.
      </p>
    </div>
  );
}

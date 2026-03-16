"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const PERMISOS_OPCIONES = ["progreso", "admin", "webhooks"] as const;

interface ApiKeyRow {
  id: string;
  keyPrefix: string;
  institucion: string;
  permisos: string[];
  createdAt: string;
  lastUsedAt: string | null;
  revoked: boolean;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [nuevoKey, setNuevoKey] = useState<string | null>(null);
  const [institucion, setInstitucion] = useState("");
  const [permisos, setPermisos] = useState<string[]>(["progreso"]);
  const [creating, setCreating] = useState(false);

  const loadKeys = () => {
    fetch("/api/admin/api-keys", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setKeys(d.keys || []))
      .catch(() => setKeys([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const handleCrear = async () => {
    if (!institucion.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ institucion: institucion.trim(), permisos }),
      });
      const d = await res.json();
      if (d.keyValue) {
        setNuevoKey(d.keyValue);
        setInstitucion("");
        setPermisos(["progreso"]);
        loadKeys();
      }
    } finally {
      setCreating(false);
    }
  };

  const togglePermiso = (p: string) => {
    setPermisos((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  const handleRevocar = async (keyId: string) => {
    await fetch(`/api/admin/api-keys/${keyId}`, { method: "DELETE", credentials: "include" });
    setKeys((k) => k.map((x) => (x.id === keyId ? { ...x, revoked: true } : x)));
  };

  return (
    <div style={{ flex: 1, padding: "18px 16px", background: "#e8eaf0", minHeight: "100vh", fontFamily: "'Syne', sans-serif" }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/admin" style={{ fontSize: 13, color: "#8892b0", marginBottom: 8, display: "inline-block" }}>← Admin</Link>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", letterSpacing: "-0.5px" }}>API Keys</h1>
        <p style={{ fontSize: 13, color: "#8892b0", marginTop: 4 }}>Claves para integraciones. El valor completo solo se muestra una vez al crear.</p>
      </div>

      {nuevoKey && (
        <div style={{ background: "linear-gradient(135deg, #1428d4, #0a0f8a)", borderRadius: 18, padding: 20, marginBottom: 20, color: "white", boxShadow: "6px 6px 14px rgba(10,15,138,0.3)" }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Guarda esta key — no se volverá a mostrar</p>
          <code style={{ fontSize: 13, fontFamily: "'Space Mono', monospace", wordBreak: "break-all", display: "block", marginBottom: 12 }}>{nuevoKey}</code>
          <button type="button" onClick={() => setNuevoKey(null)} style={{ padding: "6px 14px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: "rgba(255,255,255,0.2)", color: "white" }}>
            Cerrar
          </button>
        </div>
      )}

      <div style={{ background: "#e8eaf0", borderRadius: 18, padding: 24, boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff", marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#0a0f8a", marginBottom: 16 }}>Crear API key</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
          <div style={{ minWidth: 200 }}>
            <label style={{ fontSize: 10, color: "#8892b0", fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6, display: "block" }}>Institución</label>
            <input
              value={institucion}
              onChange={(e) => setInstitucion(e.target.value)}
              placeholder="Nombre institución"
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "none", background: "#e8eaf0", boxShadow: "inset 3px 3px 7px #c2c8d6, inset -3px -3px 7px #ffffff", fontSize: 13, color: "#0a0f8a", outline: "none" }}
            />
          </div>
          <div>
            <span style={{ fontSize: 10, color: "#8892b0", fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6, display: "block" }}>Permisos</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {PERMISOS_OPCIONES.map((p) => (
                <label key={p} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12, color: "#0a0f8a" }}>
                  <input type="checkbox" checked={permisos.includes(p)} onChange={() => togglePermiso(p)} style={{ accentColor: "#1428d4" }} />
                  {p}
                </label>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={handleCrear}
            disabled={creating || !institucion.trim()}
            style={{ padding: "10px 20px", borderRadius: 12, border: "none", cursor: creating ? "not-allowed" : "pointer", fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 700, background: "linear-gradient(135deg, #1428d4, #0a0f8a)", color: "white", boxShadow: "4px 4px 10px rgba(10,15,138,0.3)", opacity: creating || !institucion.trim() ? 0.7 : 1 }}
          >
            {creating ? "Creando…" : "Crear key"}
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: "#8892b0", fontSize: 13 }}>Cargando…</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, background: "#e8eaf0", borderRadius: 14, boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "12px 16px", color: "#8892b0", fontWeight: 600 }}>Prefijo</th>
                <th style={{ textAlign: "left", padding: "12px 16px", color: "#8892b0", fontWeight: 600 }}>Institución</th>
                <th style={{ textAlign: "left", padding: "12px 16px", color: "#8892b0", fontWeight: 600 }}>Permisos</th>
                <th style={{ textAlign: "left", padding: "12px 16px", color: "#8892b0", fontWeight: 600 }}>Creación</th>
                <th style={{ textAlign: "left", padding: "12px 16px", color: "#8892b0", fontWeight: 600 }}>Último uso</th>
                <th style={{ textAlign: "left", padding: "12px 16px", color: "#8892b0", fontWeight: 600 }}>Estado</th>
                <th style={{ textAlign: "right", padding: "12px 16px", color: "#8892b0", fontWeight: 600 }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id} style={{ borderTop: "1px solid rgba(194,200,214,0.5)" }}>
                  <td style={{ padding: "12px 16px", fontFamily: "'Space Mono', monospace", color: "#0a0f8a" }}>{k.keyPrefix}</td>
                  <td style={{ padding: "12px 16px", color: "#4a5580" }}>{k.institucion}</td>
                  <td style={{ padding: "12px 16px", color: "#4a5580" }}>{k.permisos?.join(", ") || "—"}</td>
                  <td style={{ padding: "12px 16px", color: "#8892b0", fontSize: 12 }}>{k.createdAt ? new Date(k.createdAt).toLocaleDateString() : "—"}</td>
                  <td style={{ padding: "12px 16px", color: "#8892b0", fontSize: 12 }}>{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: k.revoked ? "rgba(216,64,64,0.15)" : "rgba(0,184,125,0.15)", color: k.revoked ? "#d84040" : "#00b87d" }}>
                      {k.revoked ? "Revocada" : "Activa"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    {!k.revoked && (
                      <button type="button" onClick={() => handleRevocar(k.id)} style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, background: "#e8eaf0", color: "#d84040", boxShadow: "2px 2px 5px #c2c8d6" }}>
                        Revocar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && keys.length === 0 && (
        <div style={{ background: "#e8eaf0", borderRadius: 18, padding: 40, textAlign: "center", boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff" }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#0a0f8a" }}>Sin API keys</p>
          <p style={{ fontSize: 13, color: "#8892b0", marginTop: 6 }}>Crea una key para integraciones institucionales.</p>
        </div>
      )}
    </div>
  );
}

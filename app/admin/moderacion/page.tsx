"use client";

import { useState, useEffect } from "react";

interface ReporteItem {
  id: string;
  tipo: "post" | "comentario" | "glosario" | "show_tell";
  contenido: string;
  autorId: string;
  autorNombre: string;
  razon: string;
  fecha: string;
  estado: "pendiente" | "aprobado" | "rechazado";
}

interface Ban {
  id: string;
  userId: string;
  razon: string;
  dias: number;
  hasta: string;
  activo: boolean;
}

export default function ModeracionPage() {
  const [tab, setTab] = useState<"cola" | "historial" | "bans">("cola");
  const [reportes, setReportes] = useState<ReporteItem[]>([]);
  const [bans, setBans] = useState<Ban[]>([]);
  const [loading, setLoading] = useState(true);

  const [banUserId, setBanUserId] = useState("");
  const [banRazon, setBanRazon] = useState("");
  const [banDias, setBanDias] = useState(7);

  useEffect(() => {
    fetch("/api/admin/moderacion", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setReportes(d.reportes || []);
        setBans(d.bans || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAprobar = async (id: string) => {
    await fetch(`/api/admin/moderacion/${id}/aprobar`, { method: "POST", credentials: "include" });
    setReportes((r) => r.map((x) => (x.id === id ? { ...x, estado: "aprobado" as const } : x)));
  };

  const handleRechazar = async (id: string, feedback: string) => {
    await fetch(`/api/admin/moderacion/${id}/rechazar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ feedback }),
    });
    setReportes((r) => r.map((x) => (x.id === id ? { ...x, estado: "rechazado" as const } : x)));
  };

  const handleBanear = async () => {
    if (!banUserId || !banRazon) return;
    await fetch("/api/admin/moderacion/ban", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ userId: banUserId, razon: banRazon, dias: banDias }),
    });
    setBanUserId("");
    setBanRazon("");
    setBanDias(7);
    fetch("/api/admin/moderacion", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setBans(d.bans || []))
      .catch(() => {});
  };

  const handleDesbanear = async (banId: string) => {
    await fetch(`/api/admin/moderacion/ban/${banId}/desbanear`, { method: "POST", credentials: "include" });
    setBans((b) => b.filter((x) => x.id !== banId));
  };

  const pendientes = reportes.filter((r) => r.estado === "pendiente");
  const historial = reportes.filter((r) => r.estado !== "pendiente");
  const bansActivos = bans.filter((b) => b.activo);

  return (
    <div style={{ flex: 1, padding: "18px 16px", background: "#e8eaf0", minHeight: "100vh", fontFamily: "'Syne', sans-serif" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", letterSpacing: "-0.5px" }}>Moderación</h1>
        <p style={{ fontSize: 13, color: "#8892b0", marginTop: 4 }}>Gestiona reportes, contenido y usuarios sancionados</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[
          { id: "cola" as const, label: `Cola (${pendientes.length})` },
          { id: "historial" as const, label: "Historial" },
          { id: "bans" as const, label: `Bans (${bansActivos.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "8px 18px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              fontFamily: "'Syne', sans-serif",
              fontSize: 13,
              fontWeight: 600,
              background: tab === t.id ? "linear-gradient(135deg, #1428d4, #0a0f8a)" : "#e8eaf0",
              color: tab === t.id ? "white" : "#4a5580",
              boxShadow: tab === t.id ? "4px 4px 10px rgba(10,15,138,0.3)" : "4px 4px 9px #c2c8d6, -4px -4px 9px #ffffff",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "cola" && (
        <div>
          {loading ? (
            <p style={{ color: "#8892b0", fontSize: 13 }}>Cargando reportes...</p>
          ) : pendientes.length === 0 ? (
            <div style={{ background: "#e8eaf0", borderRadius: 18, padding: 40, textAlign: "center", boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#0a0f8a" }}>Cola vacía</p>
              <p style={{ fontSize: 13, color: "#8892b0", marginTop: 6 }}>No hay contenido pendiente de revisión.</p>
            </div>
          ) : (
            pendientes.map((r) => (
              <ReporteCard key={r.id} reporte={r} onAprobar={handleAprobar} onRechazar={handleRechazar} />
            ))
          )}
        </div>
      )}

      {tab === "historial" && (
        <div>
          {historial.map((r) => (
            <div
              key={r.id}
              style={{
                background: "#e8eaf0",
                borderRadius: 14,
                padding: "12px 16px",
                marginBottom: 8,
                boxShadow: "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <p style={{ fontSize: 13, color: "#0a0f8a", fontWeight: 600 }}>{r.contenido?.slice(0, 60)}...</p>
                <p style={{ fontSize: 11, color: "#8892b0", marginTop: 2 }}>{r.autorNombre || r.autorId} · {r.fecha}</p>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: 20,
                  background: r.estado === "aprobado" ? "rgba(0,184,125,0.15)" : "rgba(216,64,64,0.15)",
                  color: r.estado === "aprobado" ? "#00b87d" : "#d84040",
                }}
              >
                {r.estado === "aprobado" ? "Aprobado" : "Rechazado"}
              </span>
            </div>
          ))}
        </div>
      )}

      {tab === "bans" && (
        <div>
          <div style={{ background: "#e8eaf0", borderRadius: 18, padding: 24, boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff", marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#0a0f8a", marginBottom: 16 }}>Banear usuario</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, alignItems: "end" }}>
              <div>
                <p style={{ fontSize: 10, color: "#8892b0", fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>User ID</p>
                <input
                  value={banUserId}
                  onChange={(e) => setBanUserId(e.target.value)}
                  placeholder="uid del alumno"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "none",
                    background: "#e8eaf0",
                    boxShadow: "inset 3px 3px 7px #c2c8d6, inset -3px -3px 7px #ffffff",
                    fontSize: 13,
                    color: "#0a0f8a",
                    outline: "none",
                  }}
                />
              </div>
              <div>
                <p style={{ fontSize: 10, color: "#8892b0", fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Razón</p>
                <input
                  value={banRazon}
                  onChange={(e) => setBanRazon(e.target.value)}
                  placeholder="Motivo del ban"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "none",
                    background: "#e8eaf0",
                    boxShadow: "inset 3px 3px 7px #c2c8d6, inset -3px -3px 7px #ffffff",
                    fontSize: 13,
                    color: "#0a0f8a",
                    outline: "none",
                  }}
                />
              </div>
              <button
                onClick={handleBanear}
                style={{
                  padding: "10px 20px",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 12,
                  fontWeight: 700,
                  background: "#d84040",
                  color: "white",
                  boxShadow: "4px 4px 10px rgba(216,64,64,0.3)",
                  whiteSpace: "nowrap",
                }}
              >
                Banear {banDias}d
              </button>
            </div>
            <div style={{ marginTop: 8 }}>
              <label style={{ fontSize: 11, color: "#8892b0" }}>
                Días:{" "}
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={banDias}
                  onChange={(e) => setBanDias(Number(e.target.value) || 7)}
                  style={{ width: 60, padding: "4px 8px", borderRadius: 6, border: "none", boxShadow: "inset 2px 2px 4px #c2c8d6", marginLeft: 4 }}
                />
              </label>
            </div>
          </div>

          {bansActivos.map((ban) => (
            <div
              key={ban.id}
              style={{
                background: "#e8eaf0",
                borderRadius: 14,
                padding: "12px 16px",
                marginBottom: 8,
                boxShadow: "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <p style={{ fontSize: 13, color: "#0a0f8a", fontWeight: 600, fontFamily: "'Space Mono', monospace" }}>{ban.userId}</p>
                <p style={{ fontSize: 11, color: "#8892b0", marginTop: 2 }}>{ban.razon} · hasta {ban.hasta}</p>
              </div>
              <button
                onClick={() => handleDesbanear(ban.id)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  background: "#e8eaf0",
                  color: "#4a5580",
                  boxShadow: "3px 3px 7px #c2c8d6, -3px -3px 7px #ffffff",
                }}
              >
                Desbanear
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReporteCard({
  reporte,
  onAprobar,
  onRechazar,
}: {
  reporte: ReporteItem;
  onAprobar: (id: string) => void;
  onRechazar: (id: string, feedback: string) => void;
}) {
  const [feedback, setFeedback] = useState("");
  const [rechazando, setRechazando] = useState(false);

  return (
    <div style={{ background: "#e8eaf0", borderRadius: 18, padding: 20, marginBottom: 12, boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#8892b0", textTransform: "uppercase", letterSpacing: "1px", fontFamily: "'Space Mono', monospace" }}>{reporte.tipo}</span>
        <span style={{ fontSize: 11, color: "#8892b0" }}>{reporte.fecha}</span>
      </div>
      <p style={{ fontSize: 14, color: "#0a0f8a", fontWeight: 500, marginBottom: 8 }}>{reporte.contenido}</p>
      <p style={{ fontSize: 12, color: "#8892b0", marginBottom: 4 }}>Autor: {reporte.autorNombre || reporte.autorId}</p>
      <p style={{ fontSize: 12, color: "#d84040", marginBottom: 16 }}>Razón del reporte: {reporte.razon}</p>
      {rechazando ? (
        <div>
          <input
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Feedback para el autor (opcional)"
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 10,
              border: "none",
              background: "#e8eaf0",
              boxShadow: "inset 3px 3px 7px #c2c8d6, inset -3px -3px 7px #ffffff",
              fontSize: 13,
              color: "#0a0f8a",
              outline: "none",
              marginBottom: 10,
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setRechazando(false)}
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontFamily: "'Syne', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                background: "#e8eaf0",
                color: "#4a5580",
                boxShadow: "3px 3px 7px #c2c8d6, -3px -3px 7px #ffffff",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={() => onRechazar(reporte.id, feedback)}
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontFamily: "'Syne', sans-serif",
                fontSize: 12,
                fontWeight: 700,
                background: "#d84040",
                color: "white",
                boxShadow: "4px 4px 10px rgba(216,64,64,0.3)",
              }}
            >
              Confirmar rechazo
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => onAprobar(reporte.id)}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              fontFamily: "'Syne', sans-serif",
              fontSize: 12,
              fontWeight: 700,
              background: "linear-gradient(135deg, #00b87d, #00a06c)",
              color: "white",
              boxShadow: "4px 4px 10px rgba(0,184,125,0.3)",
            }}
          >
            ✓ Aprobar
          </button>
          <button
            onClick={() => setRechazando(true)}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              fontFamily: "'Syne', sans-serif",
              fontSize: 12,
              fontWeight: 700,
              background: "#e8eaf0",
              color: "#d84040",
              boxShadow: "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff",
            }}
          >
            ✗ Rechazar
          </button>
        </div>
      )}
    </div>
  );
}

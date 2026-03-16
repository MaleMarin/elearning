"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resourceId?: string;
  timestamp: { seconds: number } | null;
  date: string;
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/audit", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setLogs(data.logs ?? []);
      })
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      style={{
        padding: 24,
        background: "#e8eaf0",
        minHeight: "100vh",
        fontFamily: "var(--font-heading)",
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <Link
          href="/admin"
          style={{
            fontSize: 12,
            color: "#8892b0",
            textDecoration: "none",
            marginBottom: 8,
            display: "inline-block",
          }}
        >
          ← Volver al panel
        </Link>
      </div>
      <h1
        style={{
          fontSize: 20,
          fontWeight: 800,
          color: "#0a0f8a",
          marginBottom: 20,
        }}
      >
        Audit Log de Accesos
      </h1>
      {loading ? (
        <p
          style={{
            color: "#8892b0",
            fontFamily: "'Space Mono', monospace",
            fontSize: 12,
          }}
        >
          Cargando registros…
        </p>
      ) : (
        <div
          style={{
            background: "#e8eaf0",
            borderRadius: 16,
            boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
            overflow: "hidden",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 12,
            }}
          >
            <thead>
              <tr style={{ background: "rgba(20,40,212,0.05)" }}>
                {["Fecha", "Usuario", "Acción", "Recurso"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 14px",
                      textAlign: "left",
                      fontWeight: 700,
                      color: "#0a0f8a",
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr
                  key={log.id}
                  style={{
                    borderTop: "1px solid rgba(194,200,214,0.3)",
                    background:
                      i % 2 === 0 ? "transparent" : "rgba(20,40,212,0.02)",
                  }}
                >
                  <td
                    style={{
                      padding: "8px 14px",
                      color: "#8892b0",
                      fontFamily: "'Space Mono', monospace",
                    }}
                  >
                    {log.date}
                  </td>
                  <td
                    style={{
                      padding: "8px 14px",
                      color: "#4a5580",
                    }}
                  >
                    {log.userId.slice(0, 12)}...
                  </td>
                  <td style={{ padding: "8px 14px" }}>
                    <span
                      style={{
                        background: "rgba(20,40,212,0.08)",
                        color: "#1428d4",
                        padding: "2px 8px",
                        borderRadius: 20,
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "8px 14px",
                      color: "#8892b0",
                      fontFamily: "'Space Mono', monospace",
                    }}
                  >
                    {log.resourceId || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <p
              style={{
                padding: 24,
                textAlign: "center",
                color: "#8892b0",
                fontSize: 12,
              }}
            >
              No hay registros de auditoría aún.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

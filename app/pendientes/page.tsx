"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type PendienteItem = { titulo: string; subtitulo?: string; href: string; vence?: string };

export default function PendientesPage() {
  const router = useRouter();
  const [datos, setDatos] = useState<{
    urgentes?: PendienteItem[];
    semana?: PendienteItem[];
    lecciones?: PendienteItem[];
    quizzes?: PendienteItem[];
  } | null>(null);

  useEffect(() => {
    fetch("/api/alumno/pendientes", { credentials: "include" })
      .then((r) => r.json())
      .then(setDatos)
      .catch(() => setDatos({ urgentes: [], semana: [], lecciones: [], quizzes: [] }));
  }, []);

  return (
    <div
      style={{
        flex: 1,
        padding: "24px 32px",
        background: "#e8eaf0",
        minHeight: "100vh",
        fontFamily: "'Raleway', sans-serif",
        maxWidth: 1100,
        margin: "0 auto",
        width: "100%",
      }}
    >
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", marginBottom: 4 }}>
        Mis pendientes
      </h1>
      <p style={{ fontSize: 13, color: "#8892b0", marginBottom: 28 }}>
        Todo lo que tienes por hacer ordenado por urgencia
      </p>

      <SeccionPendientes
        titulo="🔴 Vence pronto"
        color="#d84040"
        items={datos?.urgentes ?? []}
        onIr={router.push}
      />
      <SeccionPendientes
        titulo="🟡 Esta semana"
        color="#c89000"
        items={datos?.semana ?? []}
        onIr={router.push}
      />
      <SeccionPendientes
        titulo="📖 Lecciones pendientes"
        color="#1428d4"
        items={datos?.lecciones ?? []}
        onIr={router.push}
      />
      <SeccionPendientes
        titulo="✏️ Quizzes pendientes"
        color="#533ab7"
        items={datos?.quizzes ?? []}
        onIr={router.push}
      />
    </div>
  );
}

function SeccionPendientes({
  titulo,
  color,
  items,
  onIr,
}: {
  titulo: string;
  color: string;
  items: PendienteItem[];
  onIr: (href: string) => void;
}) {
  if (!items.length) return null;
  return (
    <div style={{ marginBottom: 28 }}>
      <p
        style={{
          fontSize: 13,
          fontWeight: 700,
          color,
          marginBottom: 12,
          fontFamily: "'Space Mono', monospace",
        }}
      >
        {titulo}
      </p>
      {items.map((item, i) => (
        <div
          key={i}
          onClick={() => onIr(item.href)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onIr(item.href);
            }
          }}
          style={{
            background: "#e8eaf0",
            borderRadius: 14,
            padding: "14px 18px",
            marginBottom: 8,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "5px 5px 12px #c2c8d6, -5px -5px 12px #ffffff",
            borderLeft: `3px solid ${color}`,
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "7px 7px 16px #c2c8d6, -7px -7px 16px #ffffff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "5px 5px 12px #c2c8d6, -5px -5px 12px #ffffff";
          }}
        >
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#0a0f8a" }}>{item.titulo}</p>
            <p
              style={{
                fontSize: 11,
                color: "#8892b0",
                marginTop: 2,
                fontFamily: "'Space Mono', monospace",
              }}
            >
              {item.subtitulo}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {item.vence && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color,
                  fontFamily: "'Space Mono', monospace",
                  background: `${color}12`,
                  padding: "3px 10px",
                  borderRadius: 20,
                }}
              >
                {item.vence}
              </span>
            )}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8892b0"
              strokeWidth="2"
              aria-hidden
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}

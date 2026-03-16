"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Lightbulb } from "lucide-react";
import { SurfaceCard, PageSection } from "@/components/ui";

type Need = { id: string; text?: string; needs?: string; createdAt: string; userId?: string };

type Agrupada = { texto: string; cantidad: number };

function NecesidadesAgrupadas({ datos }: { datos: Need[] }) {
  const agrupadas = datos.reduce((acc: Record<string, Agrupada>, item: Need) => {
    const key = ((item.needs ?? item.text) ?? "").toString().toLowerCase().trim();
    if (!key) return acc;
    if (!acc[key]) acc[key] = { texto: (item.needs ?? item.text) ?? "", cantidad: 0 };
    acc[key].cantidad += 1;
    return acc;
  }, {});

  const lista = Object.values(agrupadas)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 20);

  const max = lista.length ? Math.max(...lista.map((i) => i.cantidad)) : 0;

  return (
    <div>
      {lista.map((item, i) => (
        <div
          key={i}
          style={{
            background: "#e8eaf0",
            borderRadius: 12,
            padding: "12px 16px",
            marginBottom: 8,
            boxShadow: "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: "#0a0f8a", fontFamily: "var(--font-heading)" }}>{item.texto}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#1428d4", fontFamily: "'Space Mono', monospace" }}>
              {item.cantidad} alumno{item.cantidad !== 1 ? "s" : ""}
            </span>
          </div>
          <div
            style={{
              height: 4,
              background: "#e8eaf0",
              borderRadius: 2,
              boxShadow: "inset 2px 2px 4px #c2c8d6, inset -2px -2px 4px #ffffff",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${max > 0 ? (item.cantidad / max) * 100 : 0}%`,
                background: "linear-gradient(90deg, #1428d4, #0a0f8a)",
                borderRadius: 2,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminNecesidadesPage() {
  const [items, setItems] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/learning-needs", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d.needs) ? d.needs : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[var(--neu-bg)]">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="inline-flex items-center gap-2 text-[var(--ink-muted)] hover:text-[var(--ink)] no-underline text-sm font-medium">
            <ChevronLeft className="w-4 h-4" /> Volver
          </Link>
        </div>
        <PageSection title="Necesidades de aprendizaje" subtitle="Respuestas a «¿Qué más quieres aprender?» agrupadas por frecuencia.">
          {loading ? (
            <p className="text-[var(--ink-muted)]">Cargando…</p>
          ) : items.length === 0 ? (
            <p className="text-[var(--ink-muted)]">Aún no hay sugerencias.</p>
          ) : (
            <NecesidadesAgrupadas datos={items} />
          )}
        </PageSection>
      </div>
    </div>
  );
}

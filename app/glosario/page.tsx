"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { GlossaryTerm } from "@/components/glossary/GlossaryTerm";

interface Term {
  id: string;
  term: string;
  officialDefinition: string;
  order?: number;
  moduleId?: string;
}

const LETRAS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const MODULOS_FILTRO = ["Todos", "Ciberseguridad", "Datos Abiertos", "Innovación"];

export default function GlosarioPage() {
  const [courseId, setCourseId] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState<string | null>(null);
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [letra, setLetra] = useState<string | null>(null);
  const [modulo, setModulo] = useState<string>("Todos");
  const [expandido, setExpandido] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/curso", { credentials: "include" })
      .then((r) => r.json())
      .then((d: { course?: { id: string; title: string }; error?: string }) => {
        if (d?.course?.id) {
          setCourseId(d.course.id);
          setCourseTitle(d.course.title ?? null);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true));
  }, []);

  useEffect(() => {
    if (!courseId) return;
    fetch(`/api/glossary/${courseId}/terms`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setTerms(d.terms ?? []))
      .catch(() => setTerms([]))
      .finally(() => setLoading(false));
  }, [courseId]);

  const filtrados = useMemo(() => {
    let list = terms;
    const q = busqueda.trim().toLowerCase();
    if (q) list = list.filter((t) => t.term.toLowerCase().includes(q) || t.officialDefinition.toLowerCase().includes(q));
    if (letra) list = list.filter((t) => (t.term[0] ?? "").toUpperCase() === letra);
    if (modulo !== "Todos") list = list.filter((t) => (t as Term & { moduleName?: string }).moduleName === modulo);
    return list;
  }, [terms, busqueda, letra, modulo]);

  const baseLayout = {
    flex: 1,
    padding: "24px 32px",
    background: "#e8eaf0",
    minHeight: "100vh",
    fontFamily: "'Raleway', sans-serif",
    maxWidth: 1100,
    margin: "0 auto",
    width: "100%",
  } as const;

  if (notFound) {
    return (
      <div style={baseLayout}>
        <div style={{ background: "#e8eaf0", borderRadius: 20, padding: 40, textAlign: "center", boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0a0f8a", marginBottom: 8 }}>Sin curso asignado</h2>
          <p style={{ fontSize: 13, color: "#8892b0", marginBottom: 24 }}>El glosario está disponible cuando tienes un curso asignado.</p>
          <Link href="/inicio" style={{ fontSize: 14, fontWeight: 600, color: "#1428d4" }}>Volver a inicio</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={baseLayout}>
      <Link href="/curso" style={{ fontSize: 13, color: "#8892b0", marginBottom: 12, display: "inline-block" }}>
        ← Curso
      </Link>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", marginBottom: 4 }}>Glosario</h1>
      <p style={{ fontSize: 13, color: "#8892b0", marginBottom: 24 }}>
        {courseTitle ? `Términos del curso: ${courseTitle}` : "Términos clave del curso."}
      </p>

      <div
        style={{
          background: "#e8eaf0",
          borderRadius: 14,
          padding: "12px 16px",
          marginBottom: 20,
          boxShadow: "inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff",
        }}
      >
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar término o definición..."
          aria-label="Buscar en el glosario"
          style={{
            width: "100%",
            border: "none",
            background: "transparent",
            outline: "none",
            fontSize: 14,
            color: "#0a0f8a",
            fontFamily: "'Source Sans 3', sans-serif",
          }}
        />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#8892b0", fontFamily: "'Space Mono', monospace", alignSelf: "center" }}>Letra:</span>
        {LETRAS.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLetra((prev) => (prev === l ? null : l))}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontFamily: "'Space Mono', monospace",
              fontSize: 12,
              fontWeight: 700,
              background: letra === l ? "linear-gradient(135deg, #1428d4, #0a0f8a)" : "#e8eaf0",
              color: letra === l ? "white" : "#4a5580",
              boxShadow: letra === l ? "none" : "3px 3px 7px #c2c8d6, -3px -3px 7px #ffffff",
            }}
          >
            {l}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
        {MODULOS_FILTRO.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setModulo(m)}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              fontFamily: "'Raleway', sans-serif",
              fontSize: 12,
              fontWeight: 600,
              background: "#e8eaf0",
              color: modulo === m ? "#0a0f8a" : "#8892b0",
              boxShadow: modulo === m ? "inset 2px 2px 5px #c2c8d6, inset -2px -2px 5px #ffffff" : "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff",
            }}
          >
            {m}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ fontSize: 13, color: "#8892b0" }}>Cargando términos…</p>
      ) : filtrados.length === 0 ? (
        <p style={{ fontSize: 13, color: "#8892b0" }}>No hay términos que coincidan con los filtros.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {filtrados.map((t) => (
            <li key={t.id} style={{ marginBottom: 12 }}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setExpandido((prev) => (prev === t.id ? null : t.id))}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpandido((prev) => (prev === t.id ? null : t.id)); } }}
                style={{
                  background: "#e8eaf0",
                  borderRadius: 14,
                  padding: "16px 20px",
                  cursor: "pointer",
                  boxShadow: "5px 5px 12px #c2c8d6, -5px -5px 12px #ffffff",
                  borderLeft: expandido === t.id ? "4px solid #1428d4" : "4px solid transparent",
                  transition: "all 0.15s ease",
                }}
              >
                <p style={{ fontSize: 16, fontWeight: 800, color: "#0a0f8a", marginBottom: 6 }}>{t.term}</p>
                <p style={{ fontSize: 13, color: "#4a5580", lineHeight: 1.6, fontFamily: "'Source Sans 3', sans-serif" }}>{t.officialDefinition}</p>
                {expandido === t.id && courseId && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(194,200,214,0.5)" }}>
                    <GlossaryTerm courseId={courseId} termId={t.id} term={t.term} officialDefinition={t.officialDefinition} />
                  </div>
                )}
                <p style={{ fontSize: 11, color: "#8892b0", marginTop: 8, fontFamily: "'Space Mono', monospace" }}>
                  {expandido === t.id ? "↑ Cerrar" : "Clic para más contexto y enlace a la lección"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

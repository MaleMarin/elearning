"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAssistant } from "@/contexts/AssistantContext";

interface Post {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  created_at: string;
  user_id: string;
}

export default function ComunidadPage() {
  const { openDrawer } = useAssistant();
  const [posts, setPosts] = useState<Post[]>([]);
  const [cohortId, setCohortId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [flags, setFlags] = useState<Array<{ id: string; post_id: string; reason: string; severity: number; status: string }>>([]);
  const [digestLoading, setDigestLoading] = useState(false);
  const [unansweredLoading, setUnansweredLoading] = useState(false);
  const [digestResult, setDigestResult] = useState<string | null>(null);
  const [unansweredResult, setUnansweredResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "mi-grupo">("mi-grupo");
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [reportResult, setReportResult] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/community/posts")
      .then((r) => r.json())
      .then((d) => {
        setPosts(d.posts ?? []);
        setCohortId(d.cohortId ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!cohortId) return;
    fetch(`/api/community/flags?cohortId=${cohortId}`)
      .then((r) => r.json())
      .then((d) => (d.flags ? setFlags(d.flags) : []))
      .catch(() => {});
  }, [cohortId]);

  const handleDigest = () => {
    if (!cohortId) return;
    setDigestLoading(true);
    setDigestResult(null);
    fetch("/api/community/digest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cohortId,
        input: {
          topics: ["Tema 1", "Tema 2"],
          highlightedPosts: ["Post A", "Post B"],
          commonQuestions: ["¿Cómo...?", "¿Dónde...?"],
          upcomingMilestones: ["Entrega próxima semana"],
        },
      }),
    })
      .then((r) => r.json())
      .then((d) => setDigestResult(d.error ?? `Digest creado. Notificados: ${d.notified ?? 0}`))
      .catch((e) => setDigestResult(String(e)))
      .finally(() => setDigestLoading(false));
  };

  const handleUnanswered = () => {
    if (!cohortId) return;
    setUnansweredLoading(true);
    setUnansweredResult(null);
    fetch("/api/community/unanswered", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cohortId, olderThanHours: 24 }),
    })
      .then((r) => r.json())
      .then((d) => setUnansweredResult(d.error ?? `Encontrados: ${d.count ?? 0}. ${d.summary ?? ""}`))
      .catch((e) => setUnansweredResult(String(e)))
      .finally(() => setUnansweredLoading(false));
  };

  const baseStyle = {
    flex: 1,
    padding: "20px 20px",
    background: "#e8eaf0",
    minHeight: "100vh",
    fontFamily: "var(--font-heading)",
  } as const;

  if (loading) {
    return (
      <div style={baseStyle}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", marginBottom: 4 }}>Comunidad</h1>
        <p style={{ fontSize: 13, color: "#8892b0", marginBottom: 24 }}>Cargando…</p>
      </div>
    );
  }

  const noCohort = !cohortId;
  const noPosts = posts.length === 0;

  if (noCohort || noPosts) {
    return (
      <div style={baseStyle}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", marginBottom: 4 }}>Comunidad</h1>
        <p style={{ fontSize: 13, color: "#8892b0", marginBottom: 24 }}>Foro de tu grupo</p>
        <div
          style={{
            background: "#e8eaf0",
            borderRadius: 20,
            padding: 40,
            textAlign: "center",
            maxWidth: 500,
            margin: "0 auto",
            boxShadow: "8px 8px 20px #c2c8d6, -8px -8px 20px #ffffff",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0a0f8a", marginBottom: 8 }}>
            {noCohort ? "Aún no formas parte de un grupo" : "Sé el primero en publicar"}
          </h2>
          <p style={{ fontSize: 13, color: "#8892b0", lineHeight: 1.6, marginBottom: 24 }}>
            {noCohort
              ? "Cuando te asignen a un programa, podrás ver y escribir en la comunidad."
              : "Las mejores comunidades empiezan con una sola persona que dice hola."}
          </p>
          {noCohort ? (
            <Link
              href="/soporte"
              style={{
                display: "inline-block",
                padding: "12px 28px",
                borderRadius: 14,
                background: "linear-gradient(135deg, #1428d4, #0a0f8a)",
                color: "white",
                fontFamily: "var(--font-heading)",
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "5px 5px 12px rgba(10,15,138,0.35)",
              }}
            >
              Ir a soporte
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => openDrawer({ mode: "community", cohortId, courseId: null })}
              style={{
                padding: "12px 28px",
                borderRadius: 14,
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-heading)",
                fontSize: 13,
                fontWeight: 700,
                background: "linear-gradient(135deg, #1428d4, #0a0f8a)",
                color: "white",
                boxShadow: "5px 5px 12px rgba(10,15,138,0.35)",
              }}
            >
              Crear publicación
            </button>
          )}
        </div>
        {!noCohort && (
          <p style={{ marginTop: 20, textAlign: "center" }}>
            <Link href="/comunidad/show-and-tell" style={{ fontSize: 13, color: "#1428d4", fontWeight: 600 }}>
              Ir a Show & Tell
            </Link>
          </p>
        )}
      </div>
    );
  }

  return (
    <div style={baseStyle}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", marginBottom: 4 }}>Comunidad</h1>
      <p style={{ fontSize: 13, color: "#8892b0", marginBottom: 24 }}>Foro privado de tu grupo</p>

      {cohortId && (
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "mi-grupo"}
            onClick={() => setActiveTab("mi-grupo")}
            style={{
              padding: "10px 18px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-heading)",
              fontSize: 13,
              fontWeight: 600,
              background: "#e8eaf0",
              color: activeTab === "mi-grupo" ? "#0a0f8a" : "#8892b0",
              boxShadow: activeTab === "mi-grupo" ? "inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff" : "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff",
            }}
          >
            Mi grupo
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "general"}
            onClick={() => setActiveTab("general")}
            style={{
              padding: "10px 18px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-heading)",
              fontSize: 13,
              fontWeight: 600,
              background: "#e8eaf0",
              color: activeTab === "general" ? "#0a0f8a" : "#8892b0",
              boxShadow: activeTab === "general" ? "inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff" : "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff",
            }}
          >
            General
          </button>
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
        <Link
          href="/comunidad/show-and-tell"
          style={{
            padding: "10px 18px",
            borderRadius: 12,
            background: "#e8eaf0",
            color: "#1428d4",
            fontFamily: "var(--font-heading)",
            fontSize: 12,
            fontWeight: 700,
            textDecoration: "none",
            boxShadow: "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff",
          }}
        >
          Show & Tell
        </Link>
        <Link
          href="/comunidad/proponer-leccion"
          style={{
            padding: "10px 18px",
            borderRadius: 12,
            background: "#e8eaf0",
            color: "#1428d4",
            fontFamily: "var(--font-heading)",
            fontSize: 12,
            fontWeight: 700,
            textDecoration: "none",
            boxShadow: "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff",
          }}
        >
          Proponer lección
        </Link>
        <button
          type="button"
          onClick={() => openDrawer({ mode: "community", cohortId, courseId: null })}
          style={{
            padding: "10px 18px",
            borderRadius: 12,
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-heading)",
            fontSize: 12,
            fontWeight: 700,
            background: "linear-gradient(135deg, #1428d4, #0a0f8a)",
            color: "white",
            boxShadow: "4px 4px 10px rgba(10,15,138,0.3)",
          }}
        >
          Abrir asistente
        </button>
        <button
          type="button"
          onClick={handleDigest}
          disabled={digestLoading}
          style={{
            padding: "10px 18px",
            borderRadius: 12,
            border: "none",
            cursor: digestLoading ? "wait" : "pointer",
            fontFamily: "var(--font-heading)",
            fontSize: 12,
            fontWeight: 700,
            background: "#e8eaf0",
            color: "#4a5580",
            boxShadow: "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff",
            opacity: digestLoading ? 0.7 : 1,
          }}
        >
          {digestLoading ? "Generando…" : "Resumir semana"}
        </button>
        <button
          type="button"
          onClick={handleUnanswered}
          disabled={unansweredLoading}
          style={{
            padding: "10px 18px",
            borderRadius: 12,
            border: "none",
            cursor: unansweredLoading ? "wait" : "pointer",
            fontFamily: "var(--font-heading)",
            fontSize: 12,
            fontWeight: 700,
            background: "#e8eaf0",
            color: "#4a5580",
            boxShadow: "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff",
            opacity: unansweredLoading ? 0.7 : 1,
          }}
        >
          {unansweredLoading ? "Buscando…" : "Preguntas sin respuesta"}
        </button>
      </div>

      {digestResult && (
        <div style={{ background: "#e8eaf0", borderRadius: 14, padding: 14, marginBottom: 16, boxShadow: "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff" }}>
          <strong style={{ color: "#0a0f8a" }}>Digest:</strong> <span style={{ color: "#4a5580" }}>{digestResult}</span>
        </div>
      )}
      {unansweredResult && (
        <div style={{ background: "#e8eaf0", borderRadius: 14, padding: 14, marginBottom: 16, boxShadow: "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff" }}>
          <strong style={{ color: "#0a0f8a" }}>Sin respuesta:</strong> <span style={{ color: "#4a5580" }}>{unansweredResult}</span>
        </div>
      )}

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: "#0a0f8a", marginBottom: 14 }}>Posts</h2>
        {reportResult && (
          <p style={{ fontSize: 13, color: "#1428d4", marginBottom: 12, padding: "8px 12px", background: "rgba(20,40,212,0.08)", borderRadius: 10 }}>{reportResult}</p>
        )}
        {posts.map((p) => (
          <article
            key={p.id}
            style={{
              background: "#e8eaf0",
              borderRadius: 18,
              padding: 20,
              marginBottom: 14,
              boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
            }}
          >
            {p.pinned && (
              <span style={{ fontSize: 11, fontWeight: 700, color: "#00b87d", fontFamily: "'Space Mono', monospace", marginBottom: 8, display: "block" }}>Fijado</span>
            )}
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0a0f8a", marginBottom: 6 }}>{p.title}</h3>
            <p style={{ fontSize: 13, color: "#4a5580", lineHeight: 1.6, marginBottom: 12 }}>{p.body}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <p style={{ fontSize: 11, color: "#8892b0", fontFamily: "'Space Mono', monospace" }}>{new Date(p.created_at).toLocaleDateString("es")}</p>
              <button
                type="button"
                disabled={reportingId === p.id}
                onClick={() => {
                  setReportingId(p.id);
                  setReportResult(null);
                  fetch(`/api/community/posts/${p.id}/report`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ reason: "Reporte de la comunidad" }),
                  })
                    .then((r) => r.json())
                    .then((d) => {
                      if (d.error) setReportResult(d.error);
                      else if (d.hidden) {
                        setReportResult("El post ha sido ocultado por acumular 3 reportes.");
                        setPosts((prev) => prev.filter((x) => x.id !== p.id));
                      } else setReportResult(`Reporte registrado (${d.reportCount ?? 0}/3).`);
                    })
                    .catch(() => setReportResult("Error al reportar"))
                    .finally(() => setReportingId(null));
                }}
                style={{
                  padding: "4px 10px",
                  borderRadius: 8,
                  border: "none",
                  cursor: reportingId === p.id ? "wait" : "pointer",
                  fontFamily: "var(--font-heading)",
                  fontSize: 11,
                  fontWeight: 600,
                  background: "#e8eaf0",
                  color: "#8892b0",
                  boxShadow: "2px 2px 5px #c2c8d6, -2px -2px 5px #ffffff",
                }}
              >
                {reportingId === p.id ? "Enviando…" : "Reportar"}
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

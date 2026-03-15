"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAssistant } from "@/contexts/AssistantContext";
import { EmptyState } from "@/components/ui/EmptyState";

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
      .catch((e) => setDigestResult(e.message))
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
      .catch((e) => setUnansweredResult(e.message))
      .finally(() => setUnansweredLoading(false));
  };

  if (loading) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-[var(--text)] mb-4">Comunidad</h1>
        <div className="card-white p-6 animate-pulse">
          <div className="h-5 bg-gray-100 rounded w-2/3" />
        </div>
      </div>
    );
  }

  const noCohort = !cohortId;
  const noPosts = posts.length === 0;

  if (noCohort || noPosts) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-[var(--text)] mb-6">Comunidad</h1>
        <EmptyState
          title={noCohort ? "Aún no formas parte de un grupo" : "Sé el primero en publicar"}
          description={
            noCohort
              ? "Cuando te asignen a un programa, podrás ver y escribir en la comunidad. Si crees que deberías tener acceso, contacta a soporte."
              : "Las mejores comunidades empiezan con una sola persona que dice hola."
          }
          ctaLabel={noCohort ? "Ir a soporte" : "Crear publicación"}
          ctaHref={noCohort ? "/soporte" : undefined}
          onCtaClick={noCohort ? undefined : () => openDrawer({ mode: "community", cohortId, courseId: null })}
          icon="💬"
        />
        {!noCohort && (
          <>
            <p className="mt-4 text-center text-[var(--text-muted)] text-base">
              Ideas: &quot;Pregunta sobre el contenido&quot;, &quot;Compartir un recurso&quot;, &quot;Duda sobre la entrega&quot;
            </p>
            <p className="mt-2 text-center text-base">
              <Link href="/comunidad/show-and-tell" className="text-[var(--primary)] font-medium hover:underline">
                Ir a Show & Tell
              </Link>
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-4">Comunidad</h1>

      {cohortId && (
        <div className="flex border-b border-[var(--line)] mb-6" role="tablist" aria-label="Secciones de comunidad">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "mi-grupo"}
            onClick={() => setActiveTab("mi-grupo")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === "mi-grupo"
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            Mi grupo
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "general"}
            onClick={() => setActiveTab("general")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === "general"
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            General
          </button>
        </div>
      )}

      {activeTab === "mi-grupo" && cohortId && (
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Foro privado de tu grupo. Solo los miembros pueden ver y participar. El facilitador puede fijar anuncios y abrir hilos por módulo.
        </p>
      )}

      <div className="flex flex-wrap gap-4 mb-6">
        <Link href="/comunidad/show-and-tell" className="btn-primary min-h-[44px] inline-flex items-center">
          Show & Tell
        </Link>
        <Link href="/comunidad/proponer-leccion" className="btn-primary min-h-[44px] inline-flex items-center">
          Proponer una lección
        </Link>
        <button
          type="button"
          onClick={() => openDrawer({ mode: "community", cohortId, courseId: null })}
          className="btn-primary min-h-[44px]"
        >
          Abrir asistente comunidad
        </button>
        <button
          type="button"
          onClick={handleDigest}
          disabled={digestLoading}
          className="btn-primary disabled:opacity-50 min-h-[44px]"
        >
          {digestLoading ? "Generando…" : "Resumir semana"}
        </button>
        <button
          type="button"
          onClick={handleUnanswered}
          disabled={unansweredLoading}
          className="btn-primary disabled:opacity-50 min-h-[44px]"
        >
          {unansweredLoading ? "Buscando…" : "Preguntas sin respuesta"}
        </button>
      </div>

      {digestResult && (
        <div className="card-white p-4 mb-4 text-base">
          <strong>Digest:</strong> {digestResult}
        </div>
      )}
      {unansweredResult && (
        <div className="card-white p-4 mb-4 text-base">
          <strong>Sin respuesta:</strong> {unansweredResult}
        </div>
      )}

      {flags.length > 0 && (
        <section className="card-white p-6 mb-6">
          <h2 className="text-lg font-semibold text-[var(--text)] mb-3">Cola de flags (mentor/admin)</h2>
          <ul className="space-y-3">
            {flags.map((f) => (
              <li key={f.id} className="border border-gray-200 rounded-lg p-3 flex justify-between items-start">
                <div>
                  <span className="font-medium">{f.reason}</span>
                  <span className="text-[var(--text-muted)] ml-2">
                    Severidad {f.severity} · {f.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--text)]">Posts</h2>
        {reportResult && (
          <p className="text-sm text-[var(--primary)] bg-[var(--primary-soft)] px-3 py-2 rounded-lg">
            {reportResult}
          </p>
        )}
        {posts.map((p) => (
          <article key={p.id} className="card-white p-4">
            {p.pinned && (
              <span className="text-[var(--accent)] text-sm font-medium mb-2 block">Fijado</span>
            )}
            <h3 className="font-semibold text-[var(--text)]">{p.title}</h3>
            <p className="text-[var(--text-muted)] text-base mt-1">{p.body}</p>
            <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
              <p className="text-sm text-[var(--text-muted)]">
                {new Date(p.created_at).toLocaleDateString("es")}
              </p>
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
                className="text-xs text-[var(--ink-muted)] hover:text-[var(--coral)] hover:underline disabled:opacity-50"
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

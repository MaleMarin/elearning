"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SurfaceCard } from "@/components/ui";
import { MentorCard } from "@/components/community/MentorCard";
import { ChevronLeft, Users } from "lucide-react";

interface Mentor {
  userId: string;
  fullName: string;
  institution: string | null;
  position: string | null;
  photoURL: string | null;
  cohortName: string | null;
  createdAt: string;
}

export default function MentoresPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ mentorId: string; mentorName: string } | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/mentors", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setMentors(d.mentors ?? []))
      .catch(() => setMentors([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/mentors/my-requests", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        const ids = new Set<string>((d.requests ?? []).map((r: { mentorId: string }) => r.mentorId));
        setRequestedIds(ids);
      })
      .catch(() => {});
  }, []);

  const handleRequestClick = (mentorId: string) => {
    const m = mentors.find((x) => x.userId === mentorId);
    setModal(m ? { mentorId, mentorName: m.fullName } : null);
    setMessage("");
  };

  const handleSubmitRequest = async () => {
    if (!modal || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/mentors/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ mentorId: modal.mentorId, message: message.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setRequestedIds((prev) => new Set(prev).add(modal.mentorId));
      setModal(null);
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl w-full space-y-6">
      <nav className="text-sm text-[var(--ink-muted)]">
        <Link href="/inicio" className="hover:text-[var(--primary)] rounded">Inicio</Link>
        {" · "}
        <span className="text-[var(--ink)] font-medium">Mentores</span>
      </nav>
      <Link href="/inicio" className="inline-flex items-center gap-2 text-[var(--ink-muted)] hover:text-[var(--ink)] text-sm font-medium">
        <ChevronLeft className="w-4 h-4" /> Volver
      </Link>
      <SurfaceCard padding="lg" clickable={false}>
        <h1 className="text-xl font-semibold text-[var(--ink)] mb-2 flex items-center gap-2">
          <Users className="w-6 h-6 text-[var(--primary)]" />
          Mentores
        </h1>
        <p className="text-sm text-[var(--ink-muted)] mb-6">
          Egresados ofrecen una sesión de 30 min. Solicita una y el equipo coordinará la conexión.
        </p>
        {loading ? (
          <p className="text-[var(--ink-muted)]">Cargando…</p>
        ) : mentors.length === 0 ? (
          <p className="text-[var(--ink-muted)]">Aún no hay mentores.</p>
        ) : (
          <ul className="space-y-4 list-none">
            {mentors.map((m) => (
              <li key={m.userId}>
                <MentorCard mentor={m} onRequest={handleRequestClick} requested={requestedIds.has(m.userId)} />
              </li>
            ))}
          </ul>
        )}
      </SurfaceCard>
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg">
            <h2 className="font-semibold text-[var(--ink)] mb-2">Solicitar sesión con {modal.mentorName}</h2>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 500))}
              placeholder="Tema o duda (opcional)"
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 rounded-lg border border-[var(--line)] text-sm mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setModal(null)} className="btn-ghost">Cancelar</button>
              <button type="button" onClick={handleSubmitRequest} disabled={submitting} className="btn-primary">Enviar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

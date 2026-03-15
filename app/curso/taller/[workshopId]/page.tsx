"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SurfaceCard, PrimaryButton, EmptyState } from "@/components/ui";
import { PeerReviewForm } from "@/components/workshop/PeerReviewForm";
import { RubricDisplay } from "@/components/workshop/RubricDisplay";
import { getDemoMode } from "@/lib/env";

type Workshop = {
  id: string;
  title: string;
  description: string;
  rubric: { id: string; label: string; maxScore: number }[];
  deadline: string | null;
  reviewDeadline: string | null;
  peerCount: number;
};
type Submission = { userId: string; content: string; fileUrl: string | null; submittedAt: string } | null;
type Assignment = { userId: string; reviewerOf: string[] } | null;
type Peer = { reviewedUserId: string; content: string; fileUrl: string | null; slot: number; reviewCompleted: boolean };

export default function TallerPage() {
  const params = useParams();
  const workshopId = String(params?.workshopId ?? "");
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [submission, setSubmission] = useState<Submission>(null);
  const [assignment, setAssignment] = useState<Assignment>(null);
  const [averageScore, setAverageScore] = useState<number | null>(null);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!workshopId) return;
    fetch(`/api/curso/taller/${workshopId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.workshop) setWorkshop(d.workshop);
        setSubmission(d.submission ?? null);
        setAssignment(d.assignment ?? null);
        setAverageScore(d.averageScore ?? null);
        if (d.submission?.content) setContent(d.submission.content);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [workshopId]);

  useEffect(() => {
    if (!workshopId || getDemoMode()) return;
    fetch(`/api/curso/taller/${workshopId}/peer-submissions`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setPeers(d.peers ?? []))
      .catch(() => setPeers([]));
  }, [workshopId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    fetch(`/api/curso/taller/${workshopId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content }),
    })
      .then((r) => r.json())
      .then(() => {
        setSubmission({ userId: "", content, fileUrl: null, submittedAt: new Date().toISOString() });
        return fetch(`/api/curso/taller/${workshopId}/peer-submissions`, { credentials: "include" });
      })
      .then((r) => r.json())
      .then((d) => setPeers(d.peers ?? []))
      .finally(() => setSaving(false));
  };

  const handleReviewSubmit = async (reviewedUserId: string, scores: Record<string, number>, feedback: string) => {
    const res = await fetch(`/api/curso/taller/${workshopId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ reviewedUserId, scores, feedback }),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    setPeers((prev) => prev.map((p) => (p.reviewedUserId === reviewedUserId ? { ...p, reviewCompleted: true } : p)));
  };

  if (loading || !workshop) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <p className="text-[var(--text-muted)]">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Link href="/curso" className="text-[var(--primary)] hover:underline text-sm mb-4 inline-block">← Volver al curso</Link>
      <h1 className="heading-hero text-[var(--ink)] mb-2">{workshop.title}</h1>
      <p className="text-[var(--text-muted)] mb-6">{workshop.description}</p>
      {averageScore !== null && (
        <SurfaceCard padding="md" className="mb-6">
          <p className="text-sm text-[var(--text-muted)]">Tu calificación promedio (por tus pares)</p>
          <p className="text-2xl font-bold text-[var(--primary)]">{averageScore}%</p>
        </SurfaceCard>
        )}
      <SurfaceCard padding="lg" clickable={false}>
        <h2 className="text-lg font-semibold text-[var(--ink)] mb-4">Tu entrega</h2>
        {submission ? (
          <div>
            <p className="text-[var(--text)] whitespace-pre-wrap">{submission.content}</p>
            <p className="text-xs text-[var(--text-muted)] mt-2">Entregado el {new Date(submission.submittedAt).toLocaleString()}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder="Escribe tu respuesta o trabajo..."
              className="w-full px-4 py-3 rounded-xl border border-[var(--line)] text-[var(--ink)]"
            />
            <PrimaryButton type="submit" disabled={saving || !content.trim()}>
              {saving ? "Enviando…" : "Enviar entrega"}
            </PrimaryButton>
          </form>
        )}
      </SurfaceCard>
      {workshop.rubric?.length > 0 && (
        <SurfaceCard padding="md" clickable={false} className="mt-6">
          <RubricDisplay rubric={workshop.rubric} readOnly />
        </SurfaceCard>
      )}
      {peers.length > 0 && (
        <div className="mt-6 space-y-6">
          <h2 className="text-lg font-semibold text-[var(--ink)]">Evaluar a tus pares</h2>
          {peers.map((peer) => (
            <PeerReviewForm
              key={peer.reviewedUserId}
              rubric={workshop.rubric}
              reviewedUserId={peer.reviewedUserId}
              slotLabel={`Trabajo ${peer.slot}`}
              submissionContent={peer.content}
              submissionFileUrl={peer.fileUrl}
              alreadySubmitted={peer.reviewCompleted}
              onSubmit={(scores, feedback) => handleReviewSubmit(peer.reviewedUserId, scores, feedback)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

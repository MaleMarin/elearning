"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SurfaceCard, PrimaryButton, SecondaryButton } from "@/components/ui";
import type { CohortChallenge, Team, ChallengeMessage } from "@/lib/types/cohort-challenge";
import { ChevronLeft, Users, MessageSquare, Send } from "lucide-react";

const POLL_INTERVAL = 4000;

export default function RetoPage() {
  const params = useParams();
  const id = params?.id as string;
  const [challenge, setChallenge] = useState<CohortChallenge | null>(null);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [createNombre, setCreateNombre] = useState("");
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [propuesta, setPropuesta] = useState("");
  const [propuestaSaving, setPropuestaSaving] = useState(false);
  const [submitPropuesta, setSubmitPropuesta] = useState(false);
  const [messages, setMessages] = useState<ChallengeMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [messageSending, setMessageSending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchChallenge = useCallback(() => {
    if (!id) return;
    fetch(`/api/retos/${id}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.challenge) setChallenge(d.challenge);
      })
      .catch(() => setChallenge(null));
  }, [id]);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.uid) setUserId(d.uid); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchChallenge();
    setLoading(false);
  }, [fetchChallenge]);

  useEffect(() => {
    if (!challenge || !userId) return;
    const t = challenge.equipos.find((e) => e.miembros.includes(userId));
    setMyTeam(t ?? null);
    if (t) setPropuesta(t.propuesta);
  }, [challenge, userId]);

  useEffect(() => {
    if (!id || !myTeam?.id) return;
    const fetchMessages = () => {
      fetch(`/api/retos/${id}/equipos/${myTeam.id}/mensajes`, { credentials: "include" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => { if (d?.messages) setMessages(d.messages); })
        .catch(() => {});
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [id, myTeam?.id]);

  useEffect(() => {
    if (!id || !myTeam?.id) return;
    const interval = setInterval(() => {
      fetch(`/api/retos/${id}`, { credentials: "include" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.challenge) {
            setChallenge(d.challenge);
            const t = d.challenge.equipos.find((e: Team) => e.miembros.includes(userId ?? ""));
            if (t) setMyTeam(t);
          }
        })
        .catch(() => {});
    }, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [id, myTeam?.id, userId]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createNombre.trim() || createSubmitting) return;
    setCreateSubmitting(true);
    try {
      const res = await fetch(`/api/retos/${id}/equipos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nombre: createNombre.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setMyTeam(data.team);
      setCreateNombre("");
      fetchChallenge();
    } catch {
      // show error
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleJoinTeam = async (teamId: string) => {
    try {
      const res = await fetch(`/api/retos/${id}/equipos/${teamId}/unirse`, { method: "POST", credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setMyTeam(data.team);
      fetchChallenge();
    } catch {
      // show error
    }
  };

  const handleSavePropuesta = async () => {
    if (!myTeam?.id || propuestaSaving) return;
    setPropuestaSaving(true);
    try {
      const res = await fetch(`/api/retos/${id}/equipos/${myTeam.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ propuesta, submit: submitPropuesta }),
      });
      const data = await res.json();
      if (res.ok && data.team) setMyTeam(data.team);
      setSubmitPropuesta(false);
    } finally {
      setPropuestaSaving(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !myTeam?.id || messageSending) return;
    setMessageSending(true);
    try {
      const res = await fetch(`/api/retos/${id}/equipos/${myTeam.id}/mensajes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text: newMessage.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.message) setMessages((prev) => [...prev, data.message]);
      setNewMessage("");
    } finally {
      setMessageSending(false);
    }
  };

  if (loading || !challenge) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <p className="text-[var(--ink-muted)]">Cargando reto…</p>
      </div>
    );
  }

  const canEdit = challenge.estado === "activo" && myTeam && !myTeam.submittedAt;
  const showResultados = challenge.estado === "completado";

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Link href="/inicio" className="inline-flex items-center gap-2 text-sm text-[var(--ink-muted)] mb-6">
        <ChevronLeft className="w-4 h-4" />
        Volver
      </Link>
      <h1 className="heading-section mb-2">{challenge.titulo}</h1>
      <p className="text-[var(--ink-muted)] mb-6">{challenge.descripcion}</p>
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-xs px-2 py-1 rounded-full bg-[var(--surface-soft)]">
          {challenge.fechaInicio ? new Date(challenge.fechaInicio).toLocaleDateString("es-MX") : ""} – {challenge.fechaFin ? new Date(challenge.fechaFin).toLocaleDateString("es-MX") : ""}
        </span>
        <span className="text-xs px-2 py-1 rounded-full bg-[var(--primary)] text-white">{challenge.estado}</span>
      </div>

      {!myTeam ? (
        <SurfaceCard padding="lg" clickable={false}>
          <h2 className="text-lg font-semibold mb-4">Formar equipo o unirse a uno</h2>
          <form onSubmit={handleCreateTeam} className="mb-6">
            <input
              type="text"
              placeholder="Nombre del nuevo equipo"
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2 mb-3 text-[var(--ink)]"
              value={createNombre}
              onChange={(e) => setCreateNombre(e.target.value)}
            />
            <PrimaryButton type="submit" disabled={createSubmitting}>
              {createSubmitting ? "Creando…" : "Formar equipo"}
            </PrimaryButton>
          </form>
          {challenge.equipos.filter((e) => e.miembros.length < 5).length > 0 && (
            <>
              <p className="text-sm font-medium text-[var(--ink)] mb-2">O unirse a un equipo existente:</p>
              <ul className="space-y-2">
                {challenge.equipos.map((e) => (
                  <li key={e.id} className="flex items-center justify-between py-2 border-b border-[var(--line-subtle)] last:border-0">
                    <span className="font-medium">{e.nombre}</span>
                    <span className="text-sm text-[var(--ink-muted)]">{e.miembros.length} miembro(s)</span>
                    <SecondaryButton type="button" onClick={() => handleJoinTeam(e.id)}>
                      Unirme
                    </SecondaryButton>
                  </li>
                ))}
              </ul>
            </>
          )}
        </SurfaceCard>
      ) : (
        <>
          <SurfaceCard padding="lg" clickable={false} className="mb-6">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Users className="w-5 h-5" />
              {myTeam.nombre}
            </h2>
            <p className="text-sm text-[var(--ink-muted)]">{myTeam.miembros.length} miembro(s)</p>
            {canEdit && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-[var(--ink)] mb-2">Propuesta del equipo (todos pueden editar)</label>
                <textarea
                  rows={8}
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-[var(--ink)] resize-y"
                  value={propuesta}
                  onChange={(e) => setPropuesta(e.target.value)}
                  onBlur={() => handleSavePropuesta()}
                  placeholder="Escriban aquí la propuesta conjunta..."
                />
                <div className="flex gap-3 mt-3">
                  <SecondaryButton onClick={() => handleSavePropuesta()} disabled={propuestaSaving}>
                    {propuestaSaving ? "Guardando…" : "Guardar borrador"}
                  </SecondaryButton>
                  <PrimaryButton
                    onClick={() => { setSubmitPropuesta(true); handleSavePropuesta(); }}
                    disabled={propuestaSaving || !!myTeam.submittedAt}
                  >
                    {myTeam.submittedAt ? "Entregado" : "Entregar propuesta"}
                  </PrimaryButton>
                </div>
              </div>
            )}
            {myTeam.submittedAt && !canEdit && (
              <p className="text-sm text-[var(--success)] mt-2">Propuesta entregada el {new Date(myTeam.submittedAt).toLocaleString("es-MX")}</p>
            )}
          </SurfaceCard>

          <SurfaceCard padding="lg" clickable={false}>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Chat del equipo
            </h2>
            <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
              {messages.map((m) => (
                <div key={m.id} className="text-sm">
                  <span className="font-medium text-[var(--ink)]">{m.userName || m.userId}</span>
                  <span className="text-[var(--ink-muted)] ml-2">{m.text}</span>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                className="flex-1 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-[var(--ink)]"
                placeholder="Escribe un mensaje..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <PrimaryButton type="submit" disabled={messageSending || !newMessage.trim()}>
                <Send className="w-4 h-4" />
              </PrimaryButton>
            </form>
          </SurfaceCard>
        </>
      )}

      {showResultados && (
        <div className="mt-8">
          <PrimaryButton href={`/reto/${id}/resultados`}>Ver resultados del reto</PrimaryButton>
        </div>
      )}
    </div>
  );
}

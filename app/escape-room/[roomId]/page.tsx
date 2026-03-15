"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { EscapeRoomPlayer } from "@/components/learning/EscapeRoomPlayer";
import { SurfaceCard, EmptyState } from "@/components/ui";
import type { EscapeRoom, EscapeRoomProgress } from "@/lib/services/escapeRoom";

export default function EscapeRoomPage() {
  const params = useParams();
  const roomId = String(params?.roomId ?? "");
  const [room, setRoom] = useState<EscapeRoom | null>(null);
  const [progress, setProgress] = useState<EscapeRoomProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) {
      setLoading(false);
      return;
    }
    fetch(`/api/escape-room/${roomId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setRoom(d.room ?? null);
        setProgress(d.progress ?? null);
      })
      .catch(() => setRoom(null))
      .finally(() => setLoading(false));
  }, [roomId]);

  const handleStart = async () => {
    const res = await fetch(`/api/escape-room/${roomId}/start`, { method: "POST", credentials: "include" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setProgress(data.progress);
    if (data.room) setRoom(data.room);
    return { progress: data.progress };
  };

  const handleSubmitAnswer = async (roomIndex: number, answer: string) => {
    const res = await fetch(`/api/escape-room/${roomId}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ roomIndex, answer }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    if (data.completed) setProgress((p) => (p ? { ...p, completedAt: new Date().toISOString() } : null));
    return { correct: data.correct, completed: data.completed ?? false };
  };

  const handleUseHint = async (roomIndex: number) => {
    const res = await fetch(`/api/escape-room/${roomId}/hint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ roomIndex }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setProgress((p) => ({
      ...p!,
      hintsUsedByRoom: { ...(p?.hintsUsedByRoom ?? {}), [roomIndex]: data.hintsUsed },
    }));
    return { hintsUsed: data.hintsUsed, allowed: data.allowed };
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <p className="text-[var(--ink-muted)]">Cargando…</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <EmptyState
          title="Escape room no encontrado"
          description="El enlace puede ser incorrecto o el escape room ya no está disponible."
          ctaLabel="Volver al inicio"
          ctaHref="/inicio"
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Link href="/inicio" className="text-[var(--primary)] hover:underline text-sm mb-4 inline-block">
        ← Inicio
      </Link>
      <EscapeRoomPlayer
        room={room}
        progress={progress}
        roomId={roomId}
        onStart={handleStart}
        onSubmitAnswer={handleSubmitAnswer}
        onUseHint={handleUseHint}
      />
    </div>
  );
}

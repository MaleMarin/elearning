"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SurfaceCard, EmptyState } from "@/components/ui";
import { ChevronLeft, Lock } from "lucide-react";

type EscapeRoomItem = { id: string; title: string; description: string; durationMinutes: number; rooms?: unknown[] };

export default function AdminEscapeRoomsPage() {
  const [rooms, setRooms] = useState<EscapeRoomItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/escape-room/list", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setRooms(d.rooms ?? []))
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/admin" className="inline-flex items-center gap-2 text-[var(--ink-muted)] hover:text-[var(--ink)] text-sm mb-6">
        <ChevronLeft className="w-4 h-4" /> Admin
      </Link>
      <h1 className="text-xl font-semibold text-[var(--ink)] mb-2 flex items-center gap-2">
        <Lock className="w-6 h-6 text-[var(--primary)]" />
        Escape rooms
      </h1>
      <p className="text-sm text-[var(--ink-muted)] mb-6">
        Módulos tipo juego donde el alumno desbloquea salas resolviendo desafíos. El bot Claude actúa como narrador.
      </p>
      {loading ? (
        <p className="text-[var(--ink-muted)]">Cargando…</p>
      ) : rooms.length === 0 ? (
        <EmptyState
          title="Sin escape rooms"
          description="En modo demo se muestra un escape room de ejemplo. Con Firebase puedes crear escape rooms personalizados desde Firestore (colección escape_rooms)."
          ctaLabel="Ver demo"
          ctaHref="/escape-room/demo-escape"
        />
      ) : (
        <ul className="space-y-3">
          {rooms.map((r) => (
            <li key={r.id}>
              <Link href={`/escape-room/${r.id}`}>
                <SurfaceCard padding="md" clickable className="block">
                  <p className="font-medium text-[var(--ink)]">{r.title}</p>
                  <p className="text-sm text-[var(--ink-muted)] line-clamp-2">{r.description}</p>
                  <p className="text-xs text-[var(--ink-muted)] mt-2">{r.durationMinutes} min · {Array.isArray(r.rooms) ? r.rooms.length : 0} salas</p>
                </SurfaceCard>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

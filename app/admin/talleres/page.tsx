"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SurfaceCard, PageSection, EmptyState } from "@/components/ui";
import { ChevronLeft } from "lucide-react";

type Workshop = { id: string; moduleId: string; title: string; description: string; peerCount: number; deadline: string | null; reviewDeadline: string | null };

export default function AdminTalleresPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/workshops", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setWorkshops(Array.isArray(d) ? d : []))
      .catch(() => setWorkshops([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link href="/admin" className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--ink)] mb-6">
        <ChevronLeft className="w-5 h-5" /> Admin
      </Link>
      <PageSection title="Talleres (Peer Review)" subtitle="Actividades de entrega y evaluación entre pares.">
        <></>
      </PageSection>
      {loading ? (
        <p className="text-[var(--text-muted)]">Cargando…</p>
      ) : workshops.length === 0 ? (
        <EmptyState title="Sin talleres" description="Crea talleres desde los módulos del curso (crear CRUD completo desde admin de módulos)." />
      ) : (
        <div className="space-y-4">
          {workshops.map((w) => (
            <SurfaceCard key={w.id} padding="md" clickable={false}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-[var(--ink)]">{w.title}</h3>
                  <p className="text-sm text-[var(--text-muted)]">{w.description}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Evaluar {w.peerCount} pares</p>
                </div>
                <Link href={`/curso/taller/${w.id}`} className="text-sm text-[var(--primary)] hover:underline">Ver taller</Link>
              </div>
            </SurfaceCard>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { SurfaceCard } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Microscope } from "lucide-react";

export interface LabZoneCard {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: string;
  activeToday: number;
  hasNewContent: boolean;
  featured?: boolean;
}

interface LabHubProps {
  weeklyPhrase: string;
  zones: LabZoneCard[];
  hablasHumano: LabZoneCard & { name: string; description: string; href: string; icon: string };
  simulador?: LabZoneCard & { name: string; description: string; href: string; icon: string; featured?: boolean };
}

export function LabHub({ weeklyPhrase, zones, hablasHumano, simulador }: LabHubProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Microscope className="w-10 h-10 text-[var(--primary)] shrink-0" aria-hidden />
        <div>
          <h1 className="text-2xl font-bold text-[var(--ink)]">El Laboratorio</h1>
          <p className="text-[var(--ink-muted)] mt-1">Espacio de juego y exploración. Sin calificaciones, sin progreso obligatorio.</p>
        </div>
      </div>

      {weeklyPhrase && (
        <SurfaceCard padding="md" clickable={false} className="border-[var(--primary)]/20 bg-[var(--primary-soft)]/30">
          <p className="text-[var(--ink)] italic">&ldquo;{weeklyPhrase}&rdquo;</p>
        </SurfaceCard>
      )}

      {simulador && (
        <Link href={simulador.href} className="block">
          <SurfaceCard
            padding="lg"
            className="h-full flex flex-col text-white transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: "var(--azul)",
              boxShadow: "var(--neu-shadow-out-sm), 0 0 20px rgba(20, 40, 212, 0.15)",
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-2xl" aria-hidden>{simulador.icon}</span>
              <Badge variant="pendiente" className="!bg-[var(--acento)]/20 !text-[var(--acento)] !border-[var(--acento)]/40">
                SIMULADOR DE POLÍTICA PÚBLICA
              </Badge>
            </div>
            <h2 className="text-lg font-semibold mt-2">{simulador.name}</h2>
            <p className="text-sm opacity-90 mt-1 flex-1">{simulador.description}</p>
          </SurfaceCard>
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {zones.map((z) => (
          <Link key={z.id} href={z.href} className="block">
            <SurfaceCard padding="lg" className="h-full flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <span className="text-2xl" aria-hidden>{z.icon}</span>
                {z.hasNewContent && <Badge variant="pendiente">Nuevo</Badge>}
              </div>
              <h2 className="text-lg font-semibold text-[var(--ink)] mt-2">{z.name}</h2>
              <p className="text-sm text-[var(--ink-muted)] mt-1 flex-1">{z.description}</p>
              {z.activeToday > 0 && (
                <p className="text-xs text-[var(--ink-muted)] mt-3">{z.activeToday} activos hoy</p>
              )}
            </SurfaceCard>
          </Link>
        ))}
        <Link href={hablasHumano.href} className="block">
          <SurfaceCard padding="lg" className="h-full flex flex-col border-[var(--primary)]/30">
            <div className="flex items-start justify-between gap-2">
              <span className="text-2xl" aria-hidden>{hablasHumano.icon}</span>
              {hablasHumano.hasNewContent && <Badge variant="pendiente">Nuevo</Badge>}
            </div>
            <h2 className="text-lg font-semibold text-[var(--ink)] mt-2">{hablasHumano.name}</h2>
            <p className="text-sm text-[var(--ink-muted)] mt-1 flex-1">{hablasHumano.description}</p>
            {hablasHumano.activeToday > 0 && (
              <p className="text-xs text-[var(--ink-muted)] mt-3">{hablasHumano.activeToday} activos hoy</p>
            )}
          </SurfaceCard>
        </Link>
      </div>
    </div>
  );
}

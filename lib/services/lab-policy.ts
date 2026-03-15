/**
 * Adivina la política pública — pistas progresivas.
 * En demo: casos estáticos. En real: Firestore y/o Claude.
 */

import { getDemoMode } from "@/lib/env";

export interface PolicyCase {
  id: string;
  pistas: string[];
  pais: string;
  anio: string;
  nombre: string;
  resultado: string;
}

const DEMO_CASES: PolicyCase[] = [
  {
    id: "demo-1",
    pistas: [
      "Esta política mejoró la atención a ciudadanos en zonas rurales.",
      "Fue implementada en un país sudamericano.",
      "Usó tecnología móvil como canal principal.",
      "El país es conocido por sus montañas y su modelo de salud pública.",
    ],
    pais: "Chile",
    anio: "2020",
    nombre: "Programa de Telemedicina Rural",
    resultado: "Llevó consultas especializadas a zonas alejadas vía dispositivos móviles.",
  },
  {
    id: "demo-2",
    pistas: [
      "Esta política redujo la tramitación presencial para un documento clave.",
      "Se implementó en un país europeo pequeño.",
      "Más del 99% de los trámites gubernamentales son digitales.",
      "Solo bodas, divorcios y ventas de propiedades se hacen en persona.",
    ],
    pais: "Estonia",
    anio: "2000s",
    nombre: "e-Estonia",
    resultado: "Referente mundial en gobierno digital y identidad electrónica.",
  },
  {
    id: "demo-3",
    pistas: [
      "Esta iniciativa unificó la ventanilla de trámites del Estado.",
      "Es de un país latinoamericano.",
      "Integra más de 200 trámites en una sola plataforma digital.",
      "El país tiene una larga costa y es líder en innovación pública en la región.",
    ],
    pais: "Chile",
    anio: "2012",
    nombre: "ChileAtiende",
    resultado: "Ventanilla única digital para trámites del Estado.",
  },
];

export async function getRandomCase(): Promise<PolicyCase> {
  if (getDemoMode()) {
    const idx = Math.floor(Math.random() * DEMO_CASES.length);
    return DEMO_CASES[idx]!;
  }
  // TODO: leer de Firestore lab_policy_cases o generar con Claude
  const idx = Math.floor(Math.random() * DEMO_CASES.length);
  return DEMO_CASES[idx]!;
}

/** Puntos según pistas usadas: 1ª=10, 2ª=7, 3ª=5, 4ª=2, 5ª=1 (respuesta sin más pistas). */
export function pointsForCluesUsed(cluesUsed: number): number {
  const map: Record<number, number> = { 1: 10, 2: 7, 3: 5, 4: 2, 5: 1 };
  return map[Math.min(cluesUsed, 5)] ?? 1;
}

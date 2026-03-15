/**
 * Mitos y verdades — Zona Juegos del Laboratorio.
 */

import { getDemoMode } from "@/lib/env";

export interface MythItem {
  id: string;
  afirmacion: string;
  tipo: "mito" | "verdad";
  explicacion: string;
}

const DEMO_MYTHS: MythItem[] = [
  {
    id: "m1",
    afirmacion: "Con tecnología, los trámites siempre son más rápidos",
    tipo: "mito",
    explicacion: "La tecnología sobre procesos mal diseñados solo automatiza el caos. Primero hay que rediseñar el proceso, luego digitalizarlo.",
  },
  {
    id: "m2",
    afirmacion: "La inteligencia artificial puede reemplazar a los funcionarios públicos",
    tipo: "mito",
    explicacion: "La IA puede automatizar tareas repetitivas pero no puede reemplazar el juicio humano en decisiones complejas que afectan derechos ciudadanos.",
  },
  {
    id: "m3",
    afirmacion: "Un sistema digital siempre es mejor que uno en papel",
    tipo: "mito",
    explicacion: "Depende del usuario. En zonas sin internet o con adultos mayores sin habilidades digitales, el papel puede ser más inclusivo.",
  },
  {
    id: "m4",
    afirmacion: "Innovar en el gobierno es imposible por la burocracia",
    tipo: "mito",
    explicacion: "Finlandia, Estonia y Chile tienen casos de innovación radical dentro del Estado. La burocracia es un obstáculo, no una barrera absoluta.",
  },
  {
    id: "m5",
    afirmacion: "El 80% de los proyectos de transformación digital del gobierno fracasan",
    tipo: "verdad",
    explicacion: "Principalmente por falta de gestión del cambio, no por problemas técnicos. McKinsey y el BID reportan cifras similares.",
  },
  {
    id: "m6",
    afirmacion: "Estonia tiene el gobierno más digitalizado del mundo",
    tipo: "verdad",
    explicacion: "El 99% de los servicios del gobierno estonio están disponibles online. Solo bodas, divorcios y ventas de propiedades requieren presencia física.",
  },
  {
    id: "m7",
    afirmacion: "Los hackers solo atacan empresas privadas, no al gobierno",
    tipo: "mito",
    explicacion: "Los gobiernos son blanco frecuente de ciberataques por tener datos sensibles de millones de ciudadanos. Costa Rica fue atacada en 2022.",
  },
  {
    id: "m8",
    afirmacion: "Los datos del gobierno son propiedad del Estado, no de los ciudadanos",
    tipo: "mito",
    explicacion: "En la mayoría de las democracias modernas, los datos personales pertenecen al ciudadano. El Estado los administra pero no puede usarlos sin consentimiento o base legal.",
  },
  {
    id: "m9",
    afirmacion: "El co-diseño con ciudadanos retrasa la implementación de políticas",
    tipo: "mito",
    explicacion: "Cuando se hace bien, el co-diseño mejora la adopción y reduce errores costosos. La participación temprana suele ahorrar tiempo y dinero.",
  },
  {
    id: "m10",
    afirmacion: "Chile lideró índices de innovación pública en Latinoamérica en 2023",
    tipo: "verdad",
    explicacion: "Chile ha figurado en los primeros lugares en rankings regionales de gobierno digital e innovación pública.",
  },
];

export async function getMyths(): Promise<MythItem[]> {
  if (getDemoMode()) {
    return [...DEMO_MYTHS].sort(() => Math.random() - 0.5);
  }
  // TODO: Firestore lab_myths si se desea contenido editable
  return [...DEMO_MYTHS].sort(() => Math.random() - 0.5);
}
